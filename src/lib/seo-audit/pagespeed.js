import https from 'node:https';
import { getSeoConfig } from './config';

const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
// PageSpeed runs a full Lighthouse pass on Google's side. A cold run regularly
// takes 30-60s, so allow generous headroom while staying inside the audit
// route's 60s serverless budget (12s page fetch + 45s PageSpeed + DB writes).
const TIMEOUT_MS = 45_000;
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Fetch JSON using node:https instead of the global fetch.
 *
 * Why: undici (behind global fetch) enables `autoSelectFamily` by default on
 * Node 20+, which races connection attempts across every resolved address and
 * can stall for the entire timeout on some networks -- even when a plain IPv4
 * connection succeeds in a few seconds. node:https connects to a single
 * address directly and is reliable in that situation.
 */
function getJson(endpoint, timeoutMs = TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      endpoint,
      {
        headers: { Accept: 'application/json', 'User-Agent': 'WemrayRAYSEOAnalyzer/1.0' },
        timeout: timeoutMs,
        agent: false,
      },
      (response) => {
        const status = response.statusCode || 0;
        const chunks = [];
        let total = 0;

        response.on('data', (chunk) => {
          total += chunk.length;
          if (total > MAX_BYTES) {
            request.destroy(new Error('PageSpeed response was too large'));
            return;
          }
          chunks.push(chunk);
        });

        response.on('error', reject);
        response.on('end', () => {
          resolve({
            status,
            ok: status >= 200 && status < 300,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );

    request.on('timeout', () => {
      const error = new Error('The operation was aborted due to timeout');
      error.name = 'TimeoutError';
      request.destroy(error);
    });

    request.on('error', reject);
  });
}

function numericValue(audits, key) {
  const value = audits?.[key]?.numericValue;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function fieldMetric(loadingExperience, key) {
  const metric = loadingExperience?.metrics?.[key];
  if (!metric) return null;
  return typeof metric.percentile === 'number' ? metric.percentile : null;
}

export async function getPageSpeed(url) {
  const config = getSeoConfig();
  const startedAt = Date.now();
  const providerCall = {
    provider: 'pagespeed',
    endpoint: ENDPOINT,
    status: 'skipped',
    latencyMs: 0,
    costUnits: 0,
    errorMessage: '',
  };

  if (!config.pagespeedApiKey) {
    return {
      available: false,
      reason: 'PAGESPEED_API_KEY is not configured.',
      source: 'PageSpeed Insights (mobile)',
      providerCall: { ...providerCall, status: 'skipped', latencyMs: Date.now() - startedAt },
    };
  }

  const params = new URLSearchParams({
    url,
    key: config.pagespeedApiKey,
    strategy: 'mobile',
    category: 'performance',
  });

  try {
    const response = await getJson(`${ENDPOINT}?${params}`);

    providerCall.latencyMs = Date.now() - startedAt;
    providerCall.costUnits = 1;
    providerCall.status = response.ok ? 'ok' : 'error';

    if (!response.ok) {
      providerCall.errorMessage = `PageSpeed returned HTTP ${response.status}`;
      return {
        available: false,
        reason: 'PageSpeed Insights did not return a result for this page.',
        source: 'PageSpeed Insights (mobile)',
        providerCall,
      };
    }

    let data;
    try {
      data = JSON.parse(response.body);
    } catch {
      providerCall.status = 'error';
      providerCall.errorMessage = 'PageSpeed returned a response that was not valid JSON';
      return {
        available: false,
        reason: 'PageSpeed Insights did not return a result for this page.',
        source: 'PageSpeed Insights (mobile)',
        providerCall,
      };
    }

    const lighthouse = data.lighthouseResult || {};
    const audits = lighthouse.audits || {};
    const performanceScore = lighthouse.categories?.performance?.score;

    if (typeof performanceScore !== 'number') {
      providerCall.status = 'error';
      providerCall.errorMessage = 'PageSpeed response did not include a performance score';
      return {
        available: false,
        reason: 'PageSpeed Insights did not include a performance score.',
        source: 'PageSpeed Insights (mobile)',
        providerCall,
      };
    }

    const loadingExperience = data.loadingExperience || null;
    const fieldMetrics = loadingExperience?.metrics || {};

    return {
      available: true,
      source: 'PageSpeed Insights (mobile)',
      fetchedAt: new Date().toISOString(),
      score: Math.round(performanceScore * 100),
      lab: {
        lcpMs: numericValue(audits, 'largest-contentful-paint'),
        cls: numericValue(audits, 'cumulative-layout-shift'),
        inpMs:
          numericValue(audits, 'interaction-to-next-paint') ??
          numericValue(audits, 'experimental-interaction-to-next-paint'),
        tbtMs: numericValue(audits, 'total-blocking-time'),
        fcpMs: numericValue(audits, 'first-contentful-paint'),
        speedIndexMs: numericValue(audits, 'speed-index'),
        ttfbMs: numericValue(audits, 'server-response-time'),
      },
      field: loadingExperience
        ? {
            category: loadingExperience.overall_category || '',
            lcpMs: fieldMetric(loadingExperience, 'LARGEST_CONTENTFUL_PAINT_MS'),
            cls: fieldMetric(loadingExperience, 'CUMULATIVE_LAYOUT_SHIFT_SCORE'),
            inpMs:
              fieldMetric(loadingExperience, 'INTERACTION_TO_NEXT_PAINT') ??
              fieldMetric(loadingExperience, 'EXPERIMENTAL_INTERACTION_TO_NEXT_PAINT'),
            fcpMs: fieldMetric(loadingExperience, 'FIRST_CONTENTFUL_PAINT_MS'),
            ttfbMs: fieldMetric(loadingExperience, 'EXPERIMENTAL_TIME_TO_FIRST_BYTE'),
            sample: fieldMetrics,
          }
        : null,
      providerCall,
    };
  } catch (error) {
    providerCall.latencyMs = Date.now() - startedAt;
    providerCall.status = 'error';
    providerCall.errorMessage =
      error?.name === 'TimeoutError' ? 'PageSpeed request timed out' : error?.message || 'PageSpeed failed';

    return {
      available: false,
      reason:
        error?.name === 'TimeoutError'
          ? 'PageSpeed Insights timed out.'
          : 'PageSpeed Insights is temporarily unavailable.',
      source: 'PageSpeed Insights (mobile)',
      providerCall,
    };
  }
}

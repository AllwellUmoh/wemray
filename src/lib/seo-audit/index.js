import { getPageSpeed } from './pagespeed';
import { parsePage } from './parse';
import { AuditFetchError, normalizeTargetUrl, safeFetch } from './safe-fetch';
import { evaluateRules } from './rules';
import { scoreAudit } from './score';
import { RULE_VERSION, SCORE_VERSION } from './constants';

function publicPerformance(performance) {
  if (!performance) return { available: false, reason: 'PageSpeed data is unavailable.' };
  const { providerCall: _providerCall, ...rest } = performance;
  return {
    ...rest,
    field: rest.field
      ? {
          ...rest.field,
          sample: undefined,
        }
      : null,
  };
}

function buildReport({ reference, requestedUrl, fetched, page, performance, rules, score }) {
  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
  };
  for (const issue of rules.issues) {
    severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
  }

  return {
    reference,
    url: requestedUrl,
    finalUrl: fetched.finalUrl,
    httpStatus: fetched.status,
    redirects: fetched.redirects,
    fetchedAt: new Date().toISOString(),
    score,
    summary: {
      ...severityCounts,
      passed: rules.passed.length,
      notAssessed: rules.notAssessed.length,
    },
    topFixes: rules.issues
      .filter((issue) => issue.severity !== 'informational')
      .slice(0, 5)
      .map((issue) => ({
        ruleId: issue.ruleId,
        title: issue.title,
        severity: issue.severity,
        fix: issue.fix,
      })),
    issues: rules.issues,
    passed: rules.passed,
    notAssessed: rules.notAssessed,
    categories: score.categories,
    performance: publicPerformance(performance),
    page: {
      url: page.finalUrl,
      status: page.status,
      contentType: page.contentType,
      bytes: page.bytes,
      fetchMs: page.fetchMs,
      title: page.title,
      description: page.description,
      lang: page.lang,
      canonical: page.canonical,
      robots: page.robotsDirectives,
      wordCount: page.wordCount,
      h1Count: page.h1s.length,
      imageCount: page.images.length,
      linkCount: page.links.length,
      internalLinks: page.internalLinks.length,
      externalLinks: page.externalLinks.length,
      structuredDataBlocks: page.jsonLd.length,
      hreflangLinks: page.hreflang.length,
    },
    scope: {
      type: 'single-page',
      javascriptRendered: false,
      limitations: [
        'This audit checks one page, not the whole site.',
        'JavaScript-rendered content is not executed.',
        'The RAY Score is a Wemray diagnostic, not a Google score.',
        'PageSpeed data is provided by Google and may be unavailable.',
        'Backlinks, rankings and competitor data are not included.',
      ],
    },
    versions: {
      rules: RULE_VERSION,
      score: SCORE_VERSION,
    },
    disclaimer:
      'RAY SEO Analyser is a Wemray diagnostic tool. It does not represent an official Google assessment or guarantee rankings.',
  };
}

export async function runAudit({ url, reference, onProgress, signal }) {
  const normalized = normalizeTargetUrl(url);
  await onProgress?.(5, 'Resolving the page');
  await onProgress?.(15, 'Fetching the page');

  const fetched = await safeFetch(normalized.href, { signal });
  const text = fetched.body.toString('utf8');
  const contentType = String(fetched.headers['content-type'] || '').toLowerCase();
  const looksLikeHtml = /<html[\s>]/i.test(text.slice(0, 2000));

  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml') && !looksLikeHtml) {
    throw new AuditFetchError(
      'unsupported_content',
      'That URL does not appear to return an HTML page.',
      422,
    );
  }

  await onProgress?.(35, 'Reading page structure');
  const page = parsePage(text, {
    finalUrl: fetched.finalUrl,
    status: fetched.status,
    headers: fetched.headers,
    bytes: fetched.bytes,
    fetchMs: fetched.fetchMs,
  });

  await onProgress?.(55, 'Checking performance data');
  const performance = await getPageSpeed(fetched.finalUrl);

  await onProgress?.(72, 'Evaluating SEO signals');
  const rules = evaluateRules(page, performance);

  await onProgress?.(86, 'Calculating the RAY Score');
  const score = scoreAudit({
    issues: rules.issues,
    categoryStats: rules.categoryStats,
    performance,
  });

  await onProgress?.(95, 'Preparing the report');
  const report = buildReport({
    reference,
    requestedUrl: normalized.href,
    fetched,
    page,
    performance,
    rules,
    score,
  });

  return { report, page, performance, rules };
}

export { AuditFetchError, normalizeTargetUrl, safeFetch };

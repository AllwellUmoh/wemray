import { CATEGORY_LIST, SEVERITY_LABELS } from '../constants';

const SEVERITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  informational: 4,
};

function pass() {
  return { status: 'pass' };
}

function fail(severity, confidence, extra = {}) {
  return { status: 'fail', severity, confidence, ...extra };
}

function notAssessed(reason) {
  return { status: 'not_assessed', reason };
}

function tokens(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean);
}

function hasToken(value, token) {
  return tokens(value).includes(token);
}

function coverage(affected, total) {
  if (!total) return 1;
  return Math.max(0.1, Math.min(1, affected / total));
}

function samples(list, mapper, limit = 5) {
  return list.slice(0, limit).map(mapper);
}

function comparableUrl(value) {
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    return `${url.protocol}//${url.host.toLowerCase()}${path}${url.search}`;
  } catch {
    return '';
  }
}

function isHttps(page) {
  return page.finalUrl.startsWith('https://');
}

const RULES = [
  {
    id: 'crawl-http-status',
    category: 'crawlability',
    title: 'Page returns an error status',
    description: 'Search engines cannot reliably index a page that returns a 4xx or 5xx status.',
    fix: 'Return a valid 2xx response or redirect to the intended page.',
    evaluate(page) {
      if (!page.status) return notAssessed('No HTTP status was recorded.');
      if (page.status >= 400) {
        return fail('critical', 'confirmed', {
          evidence: { httpStatus: page.status },
        });
      }
      return pass();
    },
  },
  {
    id: 'crawl-https',
    category: 'crawlability',
    title: 'Page is not served over HTTPS',
    description: 'HTTPS protects visitors and is expected for a trustworthy site.',
    fix: 'Install a valid certificate and redirect all HTTP traffic to HTTPS.',
    evaluate(page) {
      return isHttps(page) ? pass() : fail('high', 'confirmed');
    },
  },
  {
    id: 'crawl-noindex',
    category: 'crawlability',
    title: 'Page is marked noindex',
    description: 'Meta robots or X-Robots-Tag tells search engines not to index the page.',
    fix: 'Remove the noindex directive if this page should appear in search.',
    evaluate(page) {
      const value = page.robotsDirectives;
      if (hasToken(value, 'noindex') || hasToken(value, 'none')) {
        return fail('critical', 'confirmed', { evidence: { directives: value } });
      }
      return pass();
    },
  },
  {
    id: 'crawl-nofollow',
    category: 'crawlability',
    title: 'Page is marked nofollow',
    description: 'Nofollow on the page tells search engines not to follow its links.',
    fix: 'Remove nofollow unless you intentionally want to stop link discovery.',
    evaluate(page) {
      if (hasToken(page.robots, 'nofollow')) {
        return fail('medium', 'confirmed', { evidence: { directives: page.robots } });
      }
      return pass();
    },
  },
  {
    id: 'crawl-canonical-missing',
    category: 'crawlability',
    title: 'Canonical URL is missing',
    description: 'A canonical helps search engines identify the preferred URL.',
    fix: 'Add a self-referencing canonical link.',
    evaluate(page) {
      if (!page.canonicalList.length) return fail('medium', 'confirmed');
      return pass();
    },
  },
  {
    id: 'crawl-canonical-multiple',
    category: 'crawlability',
    title: 'Multiple canonical URLs',
    description: 'More than one canonical gives conflicting signals.',
    fix: 'Keep a single canonical link.',
    evaluate(page) {
      if (page.canonicalList.length <= 1) {
        return page.canonicalList.length ? pass() : notAssessed('No canonical was present.');
      }
      return fail('medium', 'confirmed', {
        evidence: { canonicals: page.canonicalList.slice(0, 5) },
      });
    },
  },
  {
    id: 'crawl-canonical-mismatch',
    category: 'crawlability',
    title: 'Canonical points to another URL',
    description: 'The canonical does not match the page that was fetched.',
    fix: 'Point the canonical at the intended page, or update the page URL.',
    evaluate(page) {
      if (!page.canonical) return notAssessed('No canonical was present.');
      if (comparableUrl(page.canonical) !== comparableUrl(page.finalUrl)) {
        return fail('high', 'confirmed', {
          evidence: { canonical: page.canonical, page: page.finalUrl },
        });
      }
      return pass();
    },
  },
  {
    id: 'crawl-ai-directives',
    category: 'crawlability',
    title: 'AI crawler directives detected',
    description: 'The page includes noai or noimageai directives.',
    fix: 'Confirm this is intentional for the site’s content policy.',
    scoring: false,
    evaluate(page) {
      const value = page.robotsDirectives;
      if (hasToken(value, 'noai') || hasToken(value, 'noimageai')) {
        return fail('informational', 'confirmed', { evidence: { directives: value } });
      }
      return pass();
    },
  },
  {
    id: 'onpage-title-missing',
    category: 'onpage',
    title: 'Page title is missing',
    description: 'The title is one of the strongest on-page signals.',
    fix: 'Add a clear, specific title element.',
    evaluate(page) {
      return page.title ? pass() : fail('critical', 'confirmed');
    },
  },
  {
    id: 'onpage-title-length',
    category: 'onpage',
    title: 'Page title length is unusual',
    description: 'Titles that are very short or very long may be less useful in search results.',
    fix: 'Aim for a clear title that communicates the page topic.',
    evaluate(page) {
      if (!page.title) return notAssessed('No title was present.');
      if (page.titleLength < 15 || page.titleLength > 65) {
        return fail('medium', 'heuristic', {
          evidence: { length: page.titleLength, title: page.title },
        });
      }
      return pass();
    },
  },
  {
    id: 'onpage-description-missing',
    category: 'onpage',
    title: 'Meta description is missing',
    description: 'A description helps search engines and people understand the page.',
    fix: 'Add a specific meta description for this page.',
    evaluate(page) {
      return page.description ? pass() : fail('high', 'confirmed');
    },
  },
  {
    id: 'onpage-description-length',
    category: 'onpage',
    title: 'Meta description length is unusual',
    description: 'Descriptions outside a useful range may be shortened or look thin.',
    fix: 'Write a concise description focused on the page intent.',
    evaluate(page) {
      if (!page.description) return notAssessed('No description was present.');
      if (page.descriptionLength < 50 || page.descriptionLength > 170) {
        return fail('low', 'heuristic', {
          evidence: { length: page.descriptionLength, description: page.description },
        });
      }
      return pass();
    },
  },
  {
    id: 'onpage-h1-missing',
    category: 'onpage',
    title: 'Main heading is missing',
    description: 'A clear H1 helps people and machines understand the page.',
    fix: 'Add one clear primary heading.',
    evaluate(page) {
      return page.h1s.length ? pass() : fail('high', 'confirmed');
    },
  },
  {
    id: 'onpage-h1-multiple',
    category: 'onpage',
    title: 'Multiple main headings',
    description: 'More than one H1 can make the page hierarchy less clear.',
    fix: 'Use one H1 and structure the rest with H2 and H3.',
    evaluate(page) {
      if (page.h1s.length > 1) {
        return fail('low', 'heuristic', {
          evidence: { count: page.h1s.length, headings: page.h1s.slice(0, 4) },
        });
      }
      return pass();
    },
  },
  {
    id: 'onpage-heading-order',
    category: 'onpage',
    title: 'Heading levels skip a level',
    description: 'A skipped heading level makes the document outline harder to follow.',
    fix: 'Keep heading levels sequential.',
    evaluate(page) {
      if (page.headings.length < 2) return notAssessed('Not enough headings to assess.');
      const jumps = [];
      for (let index = 1; index < page.headings.length; index += 1) {
        const previous = page.headings[index - 1];
        const current = page.headings[index];
        if (current.level - previous.level > 1) jumps.push(current);
      }
      if (!jumps.length) return pass();
      return fail('low', 'heuristic', {
        coverage: coverage(jumps.length, Math.max(1, page.headings.length - 1)),
        evidence: { jumps: jumps.slice(0, 5) },
      });
    },
  },
  {
    id: 'onpage-lang-missing',
    category: 'onpage',
    title: 'Page language is missing',
    description: 'The html lang attribute helps browsers and search engines understand the page.',
    fix: 'Add a valid lang attribute to the html element.',
    evaluate(page) {
      return page.lang ? pass() : fail('medium', 'confirmed');
    },
  },
  {
    id: 'onpage-viewport-missing',
    category: 'onpage',
    title: 'Viewport is missing',
    description: 'Without a viewport the page may not adapt correctly on mobile devices.',
    fix: 'Add a responsive viewport meta tag.',
    evaluate(page) {
      return page.viewport ? pass() : fail('high', 'confirmed');
    },
  },
  {
    id: 'onpage-charset-missing',
    category: 'onpage',
    title: 'Character set is missing',
    description: 'A charset declaration helps browsers render text correctly.',
    fix: 'Declare UTF-8 early in the document head.',
    evaluate(page) {
      return page.charset ? pass() : fail('low', 'confirmed');
    },
  },
  {
    id: 'onpage-open-graph',
    category: 'onpage',
    title: 'Open Graph metadata is incomplete',
    description: 'Social previews are weaker when the title, description or image are missing.',
    fix: 'Add the missing Open Graph tags.',
    evaluate(page) {
      const fields = ['title', 'description', 'image'];
      const missing = fields.filter((field) => !page.openGraph[field]);
      if (!missing.length) return pass();
      return fail('low', 'heuristic', {
        coverage: coverage(missing.length, fields.length),
        evidence: { missing },
      });
    },
  },
  {
    id: 'onpage-twitter-card',
    category: 'onpage',
    title: 'Twitter card metadata is missing',
    description: 'A Twitter card improves how the page appears when shared.',
    fix: 'Add a twitter:card and supporting preview metadata.',
    evaluate(page) {
      return page.twitter.card ? pass() : fail('low', 'heuristic');
    },
  },
  {
    id: 'content-word-count',
    category: 'content',
    title: 'Page content looks thin',
    description: 'The visible page has less than 300 words.',
    fix: 'Add useful information that matches the page intent.',
    evaluate(page) {
      if (page.wordCount < 300) {
        return fail('medium', 'heuristic', { evidence: { wordCount: page.wordCount } });
      }
      return pass();
    },
  },
  {
    id: 'media-alt-missing',
    category: 'media',
    title: 'Images are missing alt text',
    description: 'Informative images need an alt description for accessibility and context.',
    fix: 'Describe informative images and leave decorative images with alt="".',
    evaluate(page) {
      const total = page.images.filter((image) => image.src).length;
      if (!total) return notAssessed('No images with a source were found.');
      const affected = page.missingAlt.length;
      if (!affected) return pass();
      return fail('high', 'confirmed', {
        coverage: coverage(affected, total),
        evidence: {
          affected,
          total,
          examples: samples(page.missingAlt, (image) => image.src),
        },
      });
    },
  },
  {
    id: 'media-empty-src',
    category: 'media',
    title: 'Images have no usable source',
    description: 'An image element without a source cannot render.',
    fix: 'Remove the image or add a valid source.',
    evaluate(page) {
      if (!page.images.length) return notAssessed('No images were found.');
      if (!page.emptyImages.length) return pass();
      return fail('medium', 'confirmed', {
        coverage: coverage(page.emptyImages.length, page.images.length),
        evidence: { count: page.emptyImages.length, total: page.images.length },
      });
    },
  },
  {
    id: 'links-internal-low',
    category: 'links',
    title: 'Few internal links',
    description: 'The page offers fewer than three internal links to related content.',
    fix: 'Add useful links to relevant pages on the site.',
    evaluate(page) {
      if (page.internalLinks.length < 3) {
        return fail('medium', 'confirmed', {
          evidence: { count: page.internalLinks.length },
        });
      }
      return pass();
    },
  },
  {
    id: 'links-empty',
    category: 'links',
    title: 'Links have no real destination',
    description: 'Empty, hash-only or JavaScript links can confuse visitors and crawlers.',
    fix: 'Use a real destination or a button for interactions.',
    evaluate(page) {
      if (!page.links.length) return notAssessed('No links were found.');
      const empty = page.links.filter((link) => link.placeholder);
      if (!empty.length) return pass();
      return fail('low', 'confirmed', {
        coverage: coverage(empty.length, page.links.length),
        evidence: {
          count: empty.length,
          total: page.links.length,
          examples: samples(empty, (link) => link.text || link.href || '(empty link)'),
        },
      });
    },
  },
  {
    id: 'links-blank-noopener',
    category: 'links',
    title: 'New-tab links lack noopener',
    description: 'Links that open a new tab should protect the opener window.',
    fix: 'Add rel="noopener noreferrer" to new-tab links.',
    evaluate(page) {
      const targetBlank = page.links.filter(
        (link) => link.target === '_blank' && !link.placeholder,
      );
      if (!targetBlank.length) return pass();
      const affected = targetBlank.filter(
        (link) => !link.rel.includes('noopener') && !link.rel.includes('noreferrer'),
      );
      if (!affected.length) return pass();
      return fail('low', 'heuristic', {
        coverage: coverage(affected.length, targetBlank.length),
        evidence: {
          count: affected.length,
          examples: samples(affected, (link) => link.resolved),
        },
      });
    },
  },
  {
    id: 'links-internal-nofollow',
    category: 'links',
    title: 'Internal links are nofollow',
    description: 'Nofollow on internal links can limit discovery of your own pages.',
    fix: 'Remove nofollow from internal links unless it is intentional.',
    evaluate(page) {
      const internal = page.internalLinks.filter((link) => link.rel.includes('nofollow'));
      if (!internal.length) return pass();
      return fail('low', 'heuristic', {
        coverage: coverage(internal.length, Math.max(1, page.internalLinks.length)),
        evidence: {
          count: internal.length,
          examples: samples(internal, (link) => link.resolved),
        },
      });
    },
  },
  {
    id: 'tech-hsts-missing',
    category: 'technical',
    title: 'HSTS header is missing',
    description: 'HTTPS pages should tell browsers to use HTTPS on future visits.',
    fix: 'Add a Strict-Transport-Security response header.',
    evaluate(page) {
      if (!isHttps(page)) return notAssessed('The page is not served over HTTPS.');
      return page.headers['strict-transport-security']
        ? pass()
        : fail('medium', 'confirmed');
    },
  },
  {
    id: 'tech-x-content-type-options-missing',
    category: 'technical',
    title: 'MIME sniffing protection is missing',
    description: 'The response does not send X-Content-Type-Options: nosniff.',
    fix: 'Add X-Content-Type-Options: nosniff.',
    evaluate(page) {
      const value = String(page.headers['x-content-type-options'] || '').toLowerCase();
      return value.includes('nosniff') ? pass() : fail('low', 'confirmed');
    },
  },
  {
    id: 'tech-mixed-content',
    category: 'technical',
    title: 'HTTPS page loads HTTP resources',
    description: 'Mixed content can be blocked by browsers and weakens the page.',
    fix: 'Load every resource over HTTPS.',
    evaluate(page) {
      if (!isHttps(page)) return notAssessed('The page is not served over HTTPS.');
      if (!page.mixedContent.length) return pass();
      return fail('high', 'confirmed', {
        coverage: coverage(page.mixedContent.length, Math.max(1, page.resourceCount)),
        evidence: {
          count: page.mixedContent.length,
          examples: page.mixedContent.slice(0, 5),
        },
      });
    },
  },
  {
    id: 'tech-compression-missing',
    category: 'technical',
    title: 'Response is not compressed',
    description: 'Compression reduces transfer size for HTML pages.',
    fix: 'Enable gzip or Brotli compression at the server or CDN.',
    evaluate(page) {
      if (!page.bytes) return notAssessed('No response body was recorded.');
      return page.contentEncoding ? pass() : fail('low', 'confirmed');
    },
  },
  {
    id: 'structured-data-missing',
    category: 'structured',
    title: 'No structured data found',
    description: 'JSON-LD can help search engines understand page entities.',
    fix: 'Add relevant schema markup where it improves understanding.',
    evaluate(page) {
      return page.jsonLd.length ? pass() : fail('low', 'heuristic');
    },
  },
  {
    id: 'structured-data-invalid',
    category: 'structured',
    title: 'Structured data does not parse',
    description: 'One or more JSON-LD blocks contain invalid JSON.',
    fix: 'Fix or remove the invalid JSON-LD blocks.',
    evaluate(page) {
      if (!page.jsonLd.length) return notAssessed('No structured data was found.');
      if (!page.invalidJsonLd.length) return pass();
      return fail('high', 'confirmed', {
        coverage: coverage(page.invalidJsonLd.length, page.jsonLd.length),
        evidence: { count: page.invalidJsonLd.length, total: page.jsonLd.length },
      });
    },
  },
  {
    id: 'intl-hreflang-invalid',
    category: 'international',
    title: 'Hreflang values are incomplete',
    description: 'Hreflang links need a valid language, optional region and URL.',
    fix: 'Correct the hreflang language, region and href values.',
    evaluate(page) {
      if (!page.hreflang.length) return notAssessed('No hreflang links were found.');
      if (!page.invalidHreflang.length) return pass();
      return fail('medium', 'confirmed', {
        coverage: coverage(page.invalidHreflang.length, page.hreflang.length),
        evidence: { invalid: page.invalidHreflang.slice(0, 5) },
      });
    },
  },
  {
    id: 'perf-lcp',
    category: 'performance',
    title: 'Largest Contentful Paint is slow',
    description: 'Mobile LCP is above the recommended threshold.',
    fix: 'Improve the largest visible element with faster images and critical resources.',
    scoring: false,
    evaluate(page, performance) {
      if (!performance.available) return notAssessed('PageSpeed data is unavailable.');
      const value = performance.lab?.lcpMs;
      if (value === null || value === undefined) return notAssessed('LCP was not reported.');
      if (value >= 4000) return fail('high', 'confirmed', { evidence: { lcpMs: value } });
      if (value >= 2500) return fail('medium', 'confirmed', { evidence: { lcpMs: value } });
      return pass();
    },
  },
  {
    id: 'perf-cls',
    category: 'performance',
    title: 'Cumulative Layout Shift is high',
    description: 'The page moves unexpectedly while loading.',
    fix: 'Reserve space for images, ads, embeds and dynamic content.',
    scoring: false,
    evaluate(page, performance) {
      if (!performance.available) return notAssessed('PageSpeed data is unavailable.');
      const value = performance.lab?.cls;
      if (value === null || value === undefined) return notAssessed('CLS was not reported.');
      if (value >= 0.25) return fail('high', 'confirmed', { evidence: { cls: value } });
      if (value >= 0.1) return fail('medium', 'confirmed', { evidence: { cls: value } });
      return pass();
    },
  },
  {
    id: 'perf-inp',
    category: 'performance',
    title: 'Interaction latency is high',
    description: 'Mobile interaction response is slower than the recommended threshold.',
    fix: 'Reduce long tasks and split heavy JavaScript work.',
    scoring: false,
    evaluate(page, performance) {
      if (!performance.available) return notAssessed('PageSpeed data is unavailable.');
      const value = performance.lab?.inpMs ?? performance.field?.inpMs;
      if (value === null || value === undefined) return notAssessed('INP was not reported.');
      if (value >= 500) return fail('high', 'confirmed', { evidence: { inpMs: value } });
      if (value >= 200) return fail('medium', 'confirmed', { evidence: { inpMs: value } });
      return pass();
    },
  },
  {
    id: 'perf-score',
    category: 'performance',
    title: 'Overall performance score is low',
    description: 'PageSpeed reports a mobile performance score below 90.',
    fix: 'Use the metric evidence to prioritise the biggest performance work.',
    scoring: false,
    evaluate(page, performance) {
      if (!performance.available) return notAssessed('PageSpeed data is unavailable.');
      const value = performance.score;
      if (value < 50) return fail('high', 'confirmed', { evidence: { score: value } });
      if (value < 75) return fail('medium', 'confirmed', { evidence: { score: value } });
      if (value < 90) return fail('low', 'confirmed', { evidence: { score: value } });
      return pass();
    },
  },
];

export function evaluateRules(page, performance) {
  const issues = [];
  const passed = [];
  const notAssessedList = [];
  const categoryStats = Object.fromEntries(
    CATEGORY_LIST.map((category) => [
      category.id,
      {
        id: category.id,
        label: category.label,
        weight: category.weight,
        assessed: 0,
        passed: 0,
        failed: 0,
        notAssessed: 0,
        issues: 0,
      },
    ]),
  );

  for (const rule of RULES) {
    let result;
    try {
      result = rule.evaluate(page, performance);
    } catch {
      result = notAssessed('The rule could not be evaluated.');
    }

    const stats = categoryStats[rule.category];
    if (result.status === 'pass') {
      stats.assessed += 1;
      stats.passed += 1;
      passed.push({ id: rule.id, category: rule.category, title: rule.title });
      continue;
    }

    if (result.status === 'not_assessed') {
      stats.notAssessed += 1;
      notAssessedList.push({
        id: rule.id,
        category: rule.category,
        title: rule.title,
        reason: result.reason || 'Not enough evidence.',
      });
      continue;
    }

    stats.assessed += 1;
    stats.failed += 1;
    stats.issues += 1;

    const severity = result.severity || 'medium';
    issues.push({
      ruleId: rule.id,
      category: rule.category,
      categoryLabel: stats.label,
      severity,
      severityLabel: SEVERITY_LABELS[severity] || severity,
      confidence: result.confidence || 'confirmed',
      title: rule.title,
      description: rule.description,
      fix: rule.fix,
      coverage: result.coverage ?? 1,
      scoring: rule.scoring !== false,
      evidence: result.evidence || {},
      affectedUrl: page.finalUrl,
    });
  }

  issues.sort((left, right) => {
    const severity = SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity];
    return severity || left.title.localeCompare(right.title);
  });

  return { issues, passed, notAssessed: notAssessedList, categoryStats };
}

export { RULES };

import * as cheerio from 'cheerio';

function resolveUrl(value, base) {
  if (!value) return '';
  try {
    return new URL(value, base).href;
  } catch {
    return '';
  }
}

function bareHost(value) {
  return String(value || '').toLowerCase().replace(/^www\./, '');
}

function metaContent($, selector) {
  return ($(selector).first().attr('content') || '').trim();
}

function headerValue(headers, name) {
  const value = headers?.[name];
  if (Array.isArray(value)) return value.join(', ');
  return value ? String(value) : '';
}

function normaliseHref(value) {
  return String(value || '').trim();
}

export function parsePage(html, { finalUrl, status, headers = {}, bytes = 0, fetchMs = 0 }) {
  const $ = cheerio.load(html, { decodeEntities: true });
  const baseHref = resolveUrl($('base[href]').first().attr('href'), finalUrl) || finalUrl;

  const title = $('title').first().text().replace(/\s+/g, ' ').trim();
  const description = metaContent($, 'meta[name="description"]');
  const robots = metaContent($, 'meta[name="robots"]').toLowerCase();
  const xRobots = headerValue(headers, 'x-robots-tag').toLowerCase();
  const lang = ($('html').attr('lang') || '').trim();
  const viewport = metaContent($, 'meta[name="viewport"]');
  const charset =
    ($('meta[charset]').first().attr('charset') || '').trim() ||
    $('meta[http-equiv]')
      .filter((_, element) => String($(element).attr('http-equiv')).toLowerCase() === 'content-type')
      .first()
      .attr('content') ||
    '';

  const canonicalList = $('link[rel="canonical"]')
    .map((_, element) => resolveUrl($(element).attr('href'), baseHref))
    .get()
    .filter(Boolean);

  const openGraph = {
    title: metaContent($, 'meta[property="og:title"]'),
    description: metaContent($, 'meta[property="og:description"]'),
    image: metaContent($, 'meta[property="og:image"]'),
  };
  const twitter = {
    card: metaContent($, 'meta[name="twitter:card"]'),
    title: metaContent($, 'meta[name="twitter:title"]'),
    description: metaContent($, 'meta[name="twitter:description"]'),
    image: metaContent($, 'meta[name="twitter:image"]'),
  };

  const headings = $('h1,h2,h3,h4,h5,h6')
    .map((_, element) => ({
      level: Number(element.tagName.slice(1)),
      text: $(element).text().replace(/\s+/g, ' ').trim().slice(0, 180),
    }))
    .get()
    .filter((heading) => heading.text);
  const h1s = headings.filter((heading) => heading.level === 1);

  const images = $('img')
    .map((_, element) => {
      const attribs = element.attribs || {};
      const src = normaliseHref(attribs.src || attribs['data-src'] || '');
      return {
        src: resolveUrl(src, baseHref),
        rawSrc: src,
        alt: Object.prototype.hasOwnProperty.call(attribs, 'alt') ? attribs.alt : null,
        hasAlt: Object.prototype.hasOwnProperty.call(attribs, 'alt'),
        width: attribs.width || '',
        height: attribs.height || '',
        loading: attribs.loading || '',
      };
    })
    .get();

  const finalHost = bareHost(new URL(finalUrl).hostname);
  const links = $('a')
    .map((_, element) => {
      const href = normaliseHref($(element).attr('href'));
      const rel = normaliseHref($(element).attr('rel')).toLowerCase();
      const target = normaliseHref($(element).attr('target')).toLowerCase();
      const resolved = resolveUrl(href, baseHref);
      const isPlaceholder =
        !href || href === '#' || href.startsWith('#') || href.startsWith('javascript:');
      let internal = false;
      if (resolved) {
        try {
          internal = bareHost(new URL(resolved).hostname) === finalHost;
        } catch {
          internal = false;
        }
      }
      return {
        href,
        resolved,
        rel,
        target,
        internal,
        placeholder: isPlaceholder,
        text: $(element).text().replace(/\s+/g, ' ').trim().slice(0, 120),
      };
    })
    .get();

  const jsonLd = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text().trim();
    if (!raw) return;
    try {
      JSON.parse(raw);
      jsonLd.push({ valid: true, raw });
    } catch {
      jsonLd.push({ valid: false, raw });
    }
  });

  const hreflang = $('link[rel="alternate"][hreflang]')
    .map((_, element) => {
      const language = ($(element).attr('hreflang') || '').trim();
      const href = resolveUrl($(element).attr('href'), baseHref);
      const validLanguage =
        /^x-default$/i.test(language) ||
        /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/i.test(language);
      return {
        language,
        href,
        valid: Boolean(language && href && validLanguage),
      };
    })
    .get();

  const mixedContent = [];
  const resources = $('script[src], link[href], img[src], iframe[src], source[src], video[src], audio[src]');
  resources.each((_, element) => {
    const value =
      $(element).attr('src') ||
      $(element).attr('href') ||
      '';
    if (/^http:\/\//i.test(value.trim())) {
      mixedContent.push(resolveUrl(value.trim(), baseHref));
    }
  });

  const bodyClone = $('body').clone();
  bodyClone.find('script, style, noscript, template, svg, canvas').remove();
  const text = bodyClone.text().replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').filter(Boolean) : [];

  const internalLinks = links.filter((link) => link.internal && !link.placeholder);
  const externalLinks = links.filter((link) => !link.internal && !link.placeholder);
  const missingAlt = images.filter((image) => !image.hasAlt && image.src);
  const emptyImages = images.filter((image) => !image.rawSrc);

  return {
    // `url` mirrors `finalUrl`: this page object always describes the URL that
    // was actually fetched (after redirects). Kept explicit because callers
    // persist it to a NOT NULL column.
    url: finalUrl,
    finalUrl,
    status,
    contentType: headerValue(headers, 'content-type'),
    contentEncoding: headerValue(headers, 'content-encoding'),
    bytes,
    fetchMs,
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    robots,
    xRobots,
    robotsDirectives: [robots, xRobots].filter(Boolean).join(', '),
    lang,
    viewport,
    charset,
    canonicalList,
    canonical: canonicalList[0] || '',
    openGraph,
    twitter,
    headings,
    h1s,
    images,
    links,
    internalLinks,
    externalLinks,
    missingAlt,
    emptyImages,
    jsonLd,
    invalidJsonLd: jsonLd.filter((item) => !item.valid),
    hreflang,
    invalidHreflang: hreflang.filter((item) => !item.valid),
    mixedContent,
    resourceCount: resources.length,
    wordCount: words.length,
    textLength: text.length,
    headers,
  };
}

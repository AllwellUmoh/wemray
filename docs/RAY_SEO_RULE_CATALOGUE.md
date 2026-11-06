# RAY SEO Rule Catalogue — Release 1

Rules implemented by the single-page RAY SEO Analyser.

Version: `1.0.0`

## Conventions

- `critical` — broken or blocked page; cap the overall score.
- `high` — strong negative signal or major missing element.
- `medium` — meaningful improvement opportunity.
- `low` — useful polish.
- `informational` — observed state; no score penalty.
- `confirmed` — directly observed in the response or markup.
- `heuristic` — a judgement based on common practice, not a Google rule.
- `coverage` — the share of affected assets, used to scale multi-asset
  penalties.
- Missing evidence is `not assessed`, never a failure.

## Crawlability

Category weight: `0.18`

| ID | Severity | Confidence | Check | Fix |
| --- | --- | --- | --- | --- |
| `crawl-http-status` | critical | confirmed | Final HTTP status is 400 or above. | Return a valid 2xx page or redirect to one. |
| `crawl-https` | high | confirmed | Final page is served over HTTP. | Serve the page over HTTPS and redirect HTTP. |
| `crawl-noindex` | critical | confirmed | Meta robots or `X-Robots-Tag` contains `noindex` or `none`. | Remove the directive if the page should rank. |
| `crawl-nofollow` | medium | confirmed | Meta robots contains `nofollow`. | Remove `nofollow` unless links should not be followed. |
| `crawl-canonical-missing` | medium | confirmed | No canonical link is present. | Add a self-referencing canonical. |
| `crawl-canonical-multiple` | medium | confirmed | More than one canonical link is present. | Keep one canonical. |
| `crawl-canonical-mismatch` | high | confirmed | Canonical points to a different normalised URL. | Point the canonical at the intended page. |
| `crawl-ai-directives` | informational | confirmed | Meta robots contains `noai` or `noimageai`. | Informational only; confirm this is intentional. |

## On-page

Category weight: `0.20`

| ID | Severity | Confidence | Check | Fix |
| --- | --- | --- | --- | --- |
| `onpage-title-missing` | critical | confirmed | No non-empty `<title>`. | Add a useful page title. |
| `onpage-title-length` | medium | heuristic | Title is shorter than 15 or longer than 65 characters. | Keep the title clear and reasonably sized. |
| `onpage-description-missing` | high | confirmed | No meta description. | Add a specific page description. |
| `onpage-description-length` | low | heuristic | Description is shorter than 50 or longer than 170 characters. | Tighten or expand the description. |
| `onpage-h1-missing` | high | confirmed | No non-empty `<h1>`. | Add one clear main heading. |
| `onpage-h1-multiple` | low | heuristic | More than one `<h1>`. | Use one primary heading. |
| `onpage-heading-order` | low | heuristic | Heading levels skip a level. | Keep heading levels sequential. |
| `onpage-lang-missing` | medium | confirmed | `<html>` has no `lang`. | Add the page language. |
| `onpage-viewport-missing` | high | confirmed | No viewport meta tag. | Add a responsive viewport declaration. |
| `onpage-charset-missing` | low | confirmed | No charset declaration. | Declare UTF-8 early in the head. |
| `onpage-open-graph` | low | confirmed | Open Graph title, description or image is missing. | Add the missing Open Graph tags. |
| `onpage-twitter-card` | low | confirmed | No Twitter card metadata. | Add a Twitter card. |

## Content

Category weight: `0.14`

| ID | Severity | Confidence | Check | Fix |
| --- | --- | --- | --- | --- |
| `content-word-count` | medium | heuristic | Less than 300 visible words. | Add useful information for the page intent. |

## Media

Category weight: `0.10`

| ID | Severity | Confidence | Check | Fix |
| --- | --- | --- | --- | --- |
| `media-alt-missing` | high | confirmed | One or more content images have no meaningful `alt`. | Describe informative images and leave decorative images empty. |
| `media-empty-src` | medium | confirmed | One or more images have no usable source. | Remove the image or add a valid source. |

## Links

Category weight: `0.10`

| ID | Severity | Confidence | Check | Fix |
| --- | --- | --- | --- | --- |
| `links-internal-low` | medium | confirmed | Fewer than three internal content links. | Add useful links to related pages. |
| `links-empty` | low | confirmed | Links use an empty `href`, `#` or a JavaScript placeholder. | Use a real destination or a button. |
| `links-blank-noopener` | low | heuristic | `target="_blank"` links do not include `noopener` or `noreferrer`. | Add `rel="noopener noreferrer"`. |
| `links-internal-nofollow` | low | heuristic | Internal links carry `nofollow`. | Remove `nofollow` from internal links. |

## Technical

Category weight: `0.10`

| ID | Severity | Confidence | Check | Fix |
| --- | --- | --- | --- | --- |
| `tech-hsts-missing` | medium | confirmed | HTTPS response has no HSTS header. | Add `Strict-Transport-Security`. |
| `tech-x-content-type-options-missing` | low | confirmed | Response has no `X-Content-Type-Options: nosniff`. | Add the header. |
| `tech-mixed-content` | high | confirmed | HTTPS page references HTTP resources. | Load all resources over HTTPS. |
| `tech-compression-missing` | low | confirmed | Response is not compressed. | Enable gzip or Brotli. |

## Structured data

Category weight: `0.05`

| ID | Severity | Confidence | Check | Fix |
| --- | --- | --- | --- | --- |
| `structured-data-missing` | low | heuristic | No JSON-LD structured data. | Add relevant schema where it helps. |
| `structured-data-invalid` | high | confirmed | One or more JSON-LD blocks do not parse. | Fix or remove invalid JSON-LD. |

## International

Category weight: `0.03`

| ID | Severity | Confidence | Check | Fix |
| --- | --- | --- | --- | --- |
| `intl-hreflang-invalid` | medium | confirmed | Hreflang links are missing a valid language, region or URL. | Correct the hreflang values. |

## Performance

Category weight: `0.10`

Performance category score comes directly from the PageSpeed Insights
performance score. Individual metric findings are evidence only and do not add a
second penalty.

| ID | Severity | Confidence | Check | Fix |
| --- | --- | --- | --- | --- |
| `perf-lcp` | high/medium | confirmed | Mobile LCP is above 4 s or 2.5 s. | Improve the largest contentful paint. |
| `perf-cls` | high/medium | confirmed | Mobile CLS is above 0.25 or 0.1. | Reserve space for dynamic content. |
| `perf-inp` | medium | confirmed | Field INP is above 200 ms. | Reduce long tasks and interaction latency. |
| `perf-score` | low/medium/high | confirmed | PageSpeed performance score is below 90, 75 or 50. | Use the metric evidence to prioritise work. |

If PageSpeed is unavailable, the whole performance category is `not assessed`
and excluded from the overall score.

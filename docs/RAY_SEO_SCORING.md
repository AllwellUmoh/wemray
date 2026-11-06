# RAY SEO Scoring — Release 1

The RAY Score is a Wemray diagnostic score. It is not a Google score, a ranking
prediction or an official assessment.

Version: `score-1.0.0`  
Rules version: `rules-1.0.0`

## Category weights

| Category | Weight |
| --- | ---: |
| Crawlability | 0.18 |
| On-page | 0.20 |
| Content | 0.14 |
| Media | 0.10 |
| Links | 0.10 |
| Technical | 0.10 |
| Structured data | 0.05 |
| International | 0.03 |
| Performance | 0.10 |

Weights total `1.00`.

## Issue penalties

Each assessed issue has:

- `severityWeight`
- `coverage` between `0.1` and `1`
- `confidenceFactor`

| Severity | Weight |
| --- | ---: |
| critical | 15 |
| high | 8 |
| medium | 4 |
| low | 1 |
| informational | 0 |

| Confidence | Factor |
| --- | ---: |
| confirmed | 1.0 |
| heuristic | 0.6 |
| limited | 0.4 |

Effective penalty:

```text
severityWeight * coverage * confidenceFactor
```

Coverage is `1` for a single-page check. For a multi-asset check:

```text
coverage = max(0.1, affectedAssets / totalAssets)
```

One issue is emitted per rule. Multiple affected assets become one issue with a
larger coverage value, not multiple penalties.

## Category scores

For crawlability, on-page, content, media, links, technical, structured data
and international:

```text
categoryScore = clamp(100 - sum(effectivePenalty), 0, 100)
```

For performance:

```text
categoryScore = PageSpeed performance score * 100
```

Performance metric findings are evidence only. They do not add a second
penalty. If PageSpeed is unavailable, the performance category is excluded.

## Overall score

Only assessed categories contribute:

```text
overall = sum(categoryScore * categoryWeight) / sum(assessedCategoryWeights)
```

The result is rounded to the nearest integer and clamped to `0–100`.

## Critical cap

If at least one confirmed `critical` issue exists:

```text
overall = min(overall, 59)
```

The cap communicates that a blocked, broken or noindexed page cannot present as
healthy even when other categories are strong.

## Grades

| Score | Grade |
| --- | --- |
| 90–100 | Excellent |
| 75–89 | Good |
| 60–74 | Fair |
| 40–59 | Weak |
| 0–39 | Poor |

## Coverage

```text
coverage = sum(weights of assessed categories) / 1.00
```

Coverage is diagnostic only. It does not change the score directly because the
overall score is already renormalised over assessed categories.

## Unavailable checks

- A missing PageSpeed response excludes the performance category.
- A failed page fetch marks the audit `failed`; no score is produced.
- A parsed page with a 4xx/5xx response still produces a report, with
  `crawl-http-status` as critical.
- Unknown evidence is `not assessed`.
- Provider failures are never converted into failed checks.

## Deduplication

Rules run once per page. A rule that applies to multiple assets aggregates them
into one issue with:

- affected count
- total count
- coverage
- up to five examples

The report must not inflate the penalty by listing every affected asset as a
separate issue.

## Reproducibility

Reports store:

- `score_version`
- `rules_version`
- assessed category weights
- issue coverage and confidence
- PageSpeed availability and source

Changing weights, severities or formulas requires a new score version.

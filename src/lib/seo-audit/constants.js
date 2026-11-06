export const RULE_VERSION = 'rules-1.0.0';
export const SCORE_VERSION = 'score-1.0.0';
export const CONSENT_VERSION = '2026-11-05';

export const CATEGORIES = {
  crawlability: {
    id: 'crawlability',
    label: 'Crawlability',
    weight: 0.18,
    description: 'Whether search engines can reach, index and trust the page.',
  },
  onpage: {
    id: 'onpage',
    label: 'On-page',
    weight: 0.2,
    description: 'Titles, descriptions, headings and page metadata.',
  },
  content: {
    id: 'content',
    label: 'Content',
    weight: 0.14,
    description: 'The visible information available to a visitor.',
  },
  media: {
    id: 'media',
    label: 'Media',
    weight: 0.1,
    description: 'Image accessibility and asset hygiene.',
  },
  links: {
    id: 'links',
    label: 'Links',
    weight: 0.1,
    description: 'Internal navigation and link hygiene.',
  },
  technical: {
    id: 'technical',
    label: 'Technical',
    weight: 0.1,
    description: 'Response headers, HTTPS and resource safety.',
  },
  structured: {
    id: 'structured',
    label: 'Structured data',
    weight: 0.05,
    description: 'Machine-readable page context.',
  },
  international: {
    id: 'international',
    label: 'International',
    weight: 0.03,
    description: 'Language and regional targeting signals.',
  },
  performance: {
    id: 'performance',
    label: 'Performance',
    weight: 0.1,
    description: 'Google PageSpeed Insights mobile performance data.',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const SEVERITY_WEIGHTS = {
  critical: 15,
  high: 8,
  medium: 4,
  low: 1,
  informational: 0,
};

export const CONFIDENCE_FACTORS = {
  confirmed: 1,
  heuristic: 0.6,
  limited: 0.4,
};

export const SEVERITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  informational: 'Info',
};

export const GRADE_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  weak: 'Weak',
  poor: 'Poor',
};

export function gradeForScore(score) {
  if (score === null || score === undefined) return null;
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'weak';
  return 'poor';
}

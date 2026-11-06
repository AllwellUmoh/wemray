import {
  CATEGORY_LIST,
  CONFIDENCE_FACTORS,
  RULE_VERSION,
  SCORE_VERSION,
  SEVERITY_WEIGHTS,
  gradeForScore,
} from './constants';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function scoreAudit({ issues, categoryStats, performance }) {
  const categories = [];
  let weightedTotal = 0;
  let assessedWeight = 0;

  for (const category of CATEGORY_LIST) {
    const stats = categoryStats[category.id];
    if (!stats) continue;

    let assessed = stats.assessed > 0;
    let categoryScore = null;

    if (category.id === 'performance') {
      assessed = Boolean(
        performance?.available && typeof performance.score === 'number',
      );
      categoryScore = assessed ? clamp(Math.round(performance.score), 0, 100) : null;
    } else if (assessed) {
      const penalty = issues
        .filter(
          (issue) =>
            issue.category === category.id &&
            issue.scoring !== false &&
            issue.severity !== 'informational',
        )
        .reduce((sum, issue) => {
          const weight = SEVERITY_WEIGHTS[issue.severity] ?? 0;
          const confidence = CONFIDENCE_FACTORS[issue.confidence] ?? 1;
          const coverage = clamp(Number(issue.coverage) || 1, 0.1, 1);
          return sum + weight * confidence * coverage;
        }, 0);

      categoryScore = clamp(Math.round(100 - penalty), 0, 100);
    }

    if (assessed && categoryScore !== null) {
      assessedWeight += category.weight;
      weightedTotal += categoryScore * category.weight;
    }

    categories.push({
      id: category.id,
      label: category.label,
      weight: category.weight,
      score: categoryScore,
      status: assessed ? 'assessed' : 'not_assessed',
      assessedRules: stats.assessed,
      passedRules: stats.passed,
      failedRules: stats.failed,
      notAssessedRules: stats.notAssessed,
      issues: stats.issues,
    });
  }

  const criticalCount = issues.filter((issue) => issue.severity === 'critical').length;
  const highCount = issues.filter((issue) => issue.severity === 'high').length;
  let overall = assessedWeight > 0 ? Math.round(weightedTotal / assessedWeight) : null;

  if (overall !== null && criticalCount > 0) overall = Math.min(overall, 59);

  return {
    overall,
    grade: gradeForScore(overall),
    version: SCORE_VERSION,
    rulesVersion: RULE_VERSION,
    coverage: Number(assessedWeight.toFixed(2)),
    criticalCount,
    highCount,
    categories,
  };
}

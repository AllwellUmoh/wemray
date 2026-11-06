'use client';

import { useCallback, useEffect, useState } from 'react';
import AppLink from '../ui/AppLink';
import Button from '../ui/Button';

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'informational'];

const SEVERITY_LABEL = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  informational: 'Info',
};

function scoreClass(score) {
  if (typeof score !== 'number') return 'na';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'bad';
}

function ScoreDial({ score, grade }) {
  const value = typeof score === 'number' ? score : null;
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div className={`ray-dial ${scoreClass(value)}`} style={{ '--pct': pct }}>
      <div className="ray-dial-in">
        <span className="ray-dial-num">{value ?? '—'}</span>
        <span className="ray-dial-of">/ 100</span>
      </div>
      <span className="ray-dial-grade">{grade || 'RAY Score'}</span>
    </div>
  );
}

function CategoryBars({ categories = [] }) {
  if (!categories.length) return null;
  return (
    <div className="ray-cats">
      {categories.map((cat) => {
        const value = typeof cat.score === 'number' ? cat.score : null;
        return (
          <div className="ray-cat" key={cat.id || cat.label}>
            <div className="ray-cat-head">
              <span>{cat.label || cat.id}</span>
              <b>{value ?? 'n/a'}</b>
            </div>
            <div className="ray-bar">
              <i
                className={scoreClass(value)}
                style={{ width: `${value == null ? 0 : Math.max(2, value)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IssueCard({ issue }) {
  const [open, setOpen] = useState(false);
  const evidence = issue.evidence && Object.keys(issue.evidence).length ? issue.evidence : null;
  return (
    <article className={`ray-issue sev-${issue.severity}`}>
      <button type="button" className="ray-issue-hd" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="ray-sev">{SEVERITY_LABEL[issue.severity] || issue.severity}</span>
        <span className="ray-issue-title">{issue.title}</span>
        <svg className={`ray-chev${open ? ' on' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className="ray-issue-meta">
        <span>{issue.categoryLabel || issue.category}</span>
        <span className={`ray-conf ${issue.confidence}`}>{issue.confidence}</span>
      </div>
      {open ? (
        <div className="ray-issue-body">
          {issue.description ? <p>{issue.description}</p> : null}
          {issue.fix ? (
            <p className="ray-fix">
              <strong>Fix:</strong> {issue.fix}
            </p>
          ) : null}
          {evidence ? (
            <pre className="ray-evidence">{JSON.stringify(evidence, null, 2)}</pre>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function Performance({ performance }) {
  if (!performance) return null;
  if (!performance.available) {
    return (
      <section className="ray-section">
        <h2>Performance</h2>
        <p className="ray-muted">{performance.reason || 'PageSpeed data is unavailable.'}</p>
      </section>
    );
  }
  const lab = performance.lab || {};
  const metrics = [
    ['LCP', lab.lcpMs != null ? `${Math.round(lab.lcpMs)} ms` : '—'],
    ['CLS', lab.cls != null ? String(lab.cls) : '—'],
    ['INP', lab.inpMs != null ? `${Math.round(lab.inpMs)} ms` : '—'],
    ['TBT', lab.tbtMs != null ? `${Math.round(lab.tbtMs)} ms` : '—'],
    ['FCP', lab.fcpMs != null ? `${Math.round(lab.fcpMs)} ms` : '—'],
    ['TTFB', lab.ttfbMs != null ? `${Math.round(lab.ttfbMs)} ms` : '—'],
  ];
  return (
    <section className="ray-section">
      <h2>Performance</h2>
      <p className="ray-muted">
        Google PageSpeed Insights · mobile · field and lab data.
        {typeof performance.score === 'number' ? (
          <> Performance score: <strong>{performance.score}/100</strong>.</>
        ) : null}
      </p>
      <div className="ray-metrics">
        {metrics.map(([key, value]) => (
          <div className="ray-metric" key={key}>
            <b>{value}</b>
            <span>{key}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RaySeoReport({ auditId, token }) {
  const [phase, setPhase] = useState('loading'); // loading | working | ready | error
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');

  const qs = token ? `?token=${encodeURIComponent(token)}` : '';

  const loadReport = useCallback(async () => {
    const res = await fetch(`/api/public/audits/${auditId}/report${qs}`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.report) {
      setReport(data.report);
      setMeta({ reference: data.reference });
      setPhase('ready');
      return true;
    }
    if (res.status === 409) {
      return false;
    }
    setError(data.error || 'We could not load this report.');
    setPhase('error');
    return true;
  }, [auditId, qs]);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const poll = async () => {
      if (cancelled) return;
      const finished = await loadReport();
      if (cancelled || finished) return;
      // Report not ready — check status for progress, then retry.
      try {
        const statusRes = await fetch(`/api/public/audits/${auditId}/status${qs}`, {
          cache: 'no-store',
        });
        const statusData = await statusRes.json().catch(() => ({}));
        if (cancelled) return;
        if (!statusRes.ok) {
          setError(statusData.error || 'We could not find this report.');
          setPhase('error');
          return;
        }
        setProgress(statusData.progress || 0);
        if (statusData.status === 'failed') {
          setError(statusData.error?.message || 'The audit could not be completed.');
          setPhase('error');
          return;
        }
        setPhase('working');
        timer = setTimeout(poll, 2000);
      } catch {
        if (!cancelled) {
          setError('We could not reach the server.');
          setPhase('error');
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [auditId, qs, loadReport]);

  if (phase === 'loading') {
    return (
      <div className="ray-state">
        <div className="ray-spinner" aria-hidden="true" />
        <p>Loading your report…</p>
      </div>
    );
  }

  if (phase === 'working') {
    return (
      <div className="ray-state">
        <div className="ray-spinner" aria-hidden="true" />
        <h1>Auditing your page…</h1>
        <p>This usually takes a few seconds. Keep this tab open.</p>
        <div className="ray-progress">
          <i style={{ width: `${Math.max(8, progress)}%` }} />
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="ray-state ray-state-error">
        <h1>We could not produce the report</h1>
        <p>{error}</p>
        <div className="ray-state-actions">
          <Button variant="pur" to="/tools/ray-seo-analyser" arrow>
            Try another page
          </Button>
          <AppLink className="ray-link" href="/contact">
            Contact us
          </AppLink>
        </div>
      </div>
    );
  }

  const summary = report.summary || {};
  const issues = (report.issues || []).slice().sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  return (
    <div className="ray-report">
      <header className="ray-report-hd">
        <div className="ray-report-id">
          <span className="eb"><span className="pd" /> RAY SEO Analyser</span>
          <h1>Your page report</h1>
          <p className="ray-url">{report.finalUrl || report.url}</p>
          <p className="ray-muted">
            Reference <b>{meta?.reference || report.reference || '—'}</b>
          </p>
        </div>
        <ScoreDial score={report.score?.overall} grade={report.score?.grade} />
      </header>

      <div className="ray-actions">
        <a className="btn pur" href={`/api/public/audits/${auditId}/pdf${qs}`}>
          Download PDF
          <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <section className="ray-section">
        <h2>Score breakdown</h2>
        <CategoryBars categories={report.categories || report.score?.categories || []} />
      </section>

      <section className="ray-section">
        <h2>Summary</h2>
        <div className="ray-summary">
          <div className="ray-summary-row">
            {['critical', 'high', 'medium', 'low'].map((sev) => (
              <div key={sev} className={`ray-summary-item sev-${sev}`}>
                <b>{summary[sev] ?? 0}</b>
                <span>{SEVERITY_LABEL[sev]}</span>
              </div>
            ))}
            <div className="ray-summary-item ok">
              <b>{summary.passed ?? 0}</b>
              <span>Passed</span>
            </div>
            <div className="ray-summary-item na">
              <b>{summary.notAssessed ?? 0}</b>
              <span>Not assessed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ray-section">
        <h2>Findings</h2>
        {issues.length ? (
          <div className="ray-issues">
            {issues.map((issue, index) => (
              <IssueCard key={`${issue.ruleId}-${index}`} issue={issue} />
            ))}
          </div>
        ) : (
          <p className="ray-muted">No scoring issues were found for this page.</p>
        )}
      </section>

      <Performance performance={report.performance} />

      <section className="ray-section ray-scope">
        <h2>Scope and limitations</h2>
        <ul>
          {(report.scope?.limitations || [
            'This audit checks one page, not the whole site.',
            'The RAY Score is a Wemray diagnostic, not a Google score.',
          ]).map((line) => (
            <li key={line}>{line}</li>
          ))}
          <li>JavaScript-rendered content is not executed.</li>
        </ul>
      </section>

      <section className="ray-cta">
        <div className="ray-cta-glow" aria-hidden="true" />
        <span className="ray-cta-eyebrow">This was one page</span>
        <h2 className="ray-cta-title">
          Imagine what we could do <span>with the whole site.</span>
        </h2>
        <p className="ray-cta-copy">
          This audit covered a single page. A full-site SEO project finds the issues that
          only show up across your pages — internal linking, duplicate content, crawl depth
          and technical structure. If you would rather we handled it, we can.
        </p>
        <div className="ray-cta-actions">
          <Button variant="pur" to="/contact" arrow>
            Let&rsquo;s fix your SEO
          </Button>
          <AppLink className="ray-cta-link" href="/services/seo">
            See our SEO services
          </AppLink>
        </div>
        <p className="ray-cta-note">
          No sales script. We reply with a clear scope, timeline and price.
        </p>
      </section>
    </div>
  );
}

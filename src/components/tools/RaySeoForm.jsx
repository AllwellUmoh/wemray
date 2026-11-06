'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '../ui/Button';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const STEPS = [
  { key: 'queued', label: 'Validating the URL' },
  { key: 'fetching', label: 'Fetching the page safely' },
  { key: 'parsing', label: 'Reading the HTML' },
  { key: 'rules', label: 'Checking the rules' },
  { key: 'scoring', label: 'Scoring and summarising' },
];

export default function RaySeoForm() {
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | submitting | working
  const [stepIndex, setStepIndex] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  const clearError = (field) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'submitting' || status === 'working') return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      url: String(data.get('url') || '').trim(),
      firstName: String(data.get('firstName') || '').trim(),
      email: String(data.get('email') || '').trim(),
      marketingConsent: data.get('marketingConsent') === 'on',
      consentVersion: String(data.get('consentVersion') || ''),
      website: String(data.get('website') || ''),
    };

    const errors = {};
    if (payload.firstName.length < 2) errors.firstName = 'Enter your first name.';
    if (!EMAIL_PATTERN.test(payload.email)) {
      errors.email = 'Enter a valid email address for the report.';
    }
    if (!payload.url) errors.url = 'Enter the page URL you want to audit.';
    if (payload.url) {
      try {
        new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(payload.url) ? payload.url : `https://${payload.url}`);
      } catch {
        errors.url = 'Enter a valid page URL, e.g. yourwebsite.com/page';
      }
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError('');
    setStatus('submitting');
    setStepIndex(0);

    // Animate the step list while the audit runs.
    const timer = setInterval(() => {
      setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
    }, 900);

    setStatus('working');

    try {
      const response = await fetch('/api/public/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      clearInterval(timer);

      if (!response.ok) {
        setStatus('idle');
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setFormError(
          result.error ||
            'We could not run the audit. Please try again, or contact us if the problem continues.',
        );
        return;
      }

      const token = result.token || '';
      router.push(
        `/tools/ray-seo-analyser/report/${result.id}?token=${encodeURIComponent(token)}`,
      );
    } catch {
      clearInterval(timer);
      setStatus('idle');
      setFormError('We could not reach the server. Please check your connection and try again.');
    }
  };

  const busy = status === 'submitting' || status === 'working';

  return (
    <form className="ray-form" onSubmit={handleSubmit} noValidate>
      <div className="ray-head">
        <span className="ray-head-title">Run your free audit</span>
        <span className="ray-head-note">One page · under a minute</span>
      </div>

      <div className="ray-fields">
        <label className={`ray-field${fieldErrors.firstName ? ' bad' : ''}`}>
          <span className="ray-label">First name</span>
          <input
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Ada"
            aria-invalid={Boolean(fieldErrors.firstName)}
            onChange={() => clearError('firstName')}
            disabled={busy}
            required
          />
          {fieldErrors.firstName ? <small className="ray-err">{fieldErrors.firstName}</small> : null}
        </label>

        <label className={`ray-field${fieldErrors.email ? ' bad' : ''}`}>
          <span className="ray-label">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={Boolean(fieldErrors.email)}
            onChange={() => clearError('email')}
            disabled={busy}
            required
          />
          {fieldErrors.email ? <small className="ray-err">{fieldErrors.email}</small> : null}
        </label>

        <label className={`ray-field${fieldErrors.url ? ' bad' : ''}`}>
          <span className="ray-label">Page URL</span>
          <div className="ray-url">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
            </svg>
            <input
              name="url"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="yourwebsite.com/page"
              aria-invalid={Boolean(fieldErrors.url)}
              onChange={() => clearError('url')}
              disabled={busy}
              required
            />
          </div>
          {fieldErrors.url ? <small className="ray-err">{fieldErrors.url}</small> : null}
        </label>
      </div>

      <label className="ray-check">
        <input type="checkbox" name="marketingConsent" disabled={busy} />
        <span>Send me occasional Wemray tips. Unsubscribe anytime.</span>
      </label>

      <input type="hidden" name="consentVersion" value="ray-seo-v1" />

      <label className="ct-hp" aria-hidden="true">
        <span>Website</span>
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="ray-act">
        <Button variant="pur" type="submit" arrow disabled={busy}>
          {busy ? 'Auditing…' : 'Run the audit'}
        </Button>
      </div>

      <p className="ray-fineprint">
        Free · one page per report · see our <a href="/privacy">Privacy Policy</a>
      </p>

      {formError ? (
        <p className="ray-form-error" role="alert">{formError}</p>
      ) : null}

      {busy ? (
        <ul className="ray-steps" aria-live="polite">
          {STEPS.map((step, index) => (
            <li
              key={step.key}
              className={index < stepIndex ? 'done' : index === stepIndex ? 'active' : ''}
            >
              <span className="ray-dot" aria-hidden="true" />
              {step.label}
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

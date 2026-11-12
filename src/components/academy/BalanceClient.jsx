'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Second-instalment checkout. The reference and email prove ownership; the
 * amount comes from the enrolment row on the server, never from the browser.
 */
export default function BalanceClient({ reference: initialReference = '' }) {
  const [reference, setReference] = useState(initialReference);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const ref = reference.trim();
    const address = email.trim();

    if (!ref || !address) {
      setError('Enter your enrolment reference and the email used at checkout.');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/academy/enrolments/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, email: address }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error || 'We could not start that payment. Please try again.');
        return;
      }

      if (result.nothingDue) {
        setMessage(result.message || 'Nothing outstanding — this enrolment is settled.');
        return;
      }

      if (!result.authorizationUrl) {
        setError('Payment could not be opened. Please try again or email hello@wemray.com.');
        return;
      }

      window.location.assign(result.authorizationUrl);
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="es">
      <div className="es-in">
        <Link className="es-back" href="/academy">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Ray Academy
        </Link>

        <div className="es-card es-neutral">
          <div className="es-ic" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20M6 15h4" />
            </svg>
          </div>

          <h1>Pay your balance</h1>
          <p className="es-lead">
            Enter the reference from your enrolment email and the email you used at checkout. We will open a secure
            Paystack checkout for the outstanding amount.
          </p>

          <form className="es-form" onSubmit={onSubmit}>
            <label className="fld">
              <input
                type="text"
                name="reference"
                placeholder=" "
                autoComplete="off"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                required
              />
              <span>Enrolment reference</span>
            </label>

            <label className="fld">
              <input
                type="email"
                name="email"
                placeholder=" "
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <span>Email address</span>
            </label>

            {error ? (
              <p className="es-error" role="alert">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="es-note ok" role="status">
                {message}
              </p>
            ) : null}

            <button className="btn pur" type="submit" disabled={busy}>
              {busy ? 'Opening secure checkout…' : 'Pay remaining balance'}
            </button>
          </form>
        </div>

        <p className="es-help">
          Need help? Email{' '}
          <a href={`mailto:hello@wemray.com?subject=Enrolment%20balance%20${encodeURIComponent(reference || '')}`}>
            hello@wemray.com
          </a>{' '}
          with your reference.
        </p>
      </div>
    </section>
  );
}

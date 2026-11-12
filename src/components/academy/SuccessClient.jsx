'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const POLL_ATTEMPTS = 10;
const POLL_INTERVAL = 3000;

const STATUS_COPY = {
  paid: 'Paid in full',
  part_paid: 'First instalment received',
  pending: 'Awaiting confirmation',
  failed: 'Payment failed',
  abandoned: 'Checkout abandoned',
  refunded: 'Refunded',
};

function Spinner() {
  return (
    <span className="es-spin" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M21 12a9 9 0 1 1-6.2-8.6" />
      </svg>
    </span>
  );
}

export default function SuccessClient({ reference, initialStatus, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [polling, setPolling] = useState(false);
  const [message, setMessage] = useState('');
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState('');
  const [autoLoading, setAutoLoading] = useState(Boolean(initialEmail));

  const settled = data?.status === 'paid' || data?.status === 'part_paid';

  const lookup = useCallback(
    async (address) => {
      const params = new URLSearchParams({ reference, email: address });
      const response = await fetch(`/api/academy/enrolments/status?${params}`, { cache: 'no-store' });
      return response.json().catch(() => ({}));
    },
    [reference],
  );

  /** Keep asking until the webhook has settled the record, or we give up. */
  const pollUntilSettled = useCallback(
    async (address) => {
      for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

        try {
          const result = await lookup(address);
          if (result?.verified) {
            setData(result);
            if (result.status === 'paid' || result.status === 'part_paid') {
              setPolling(false);
              return;
            }
          }
        } catch {
          // Transient failure while polling — try again.
        }
      }

      setPolling(false);
    },
    [lookup],
  );

  useEffect(() => {
    if (!initialEmail || !reference) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await lookup(initialEmail);
        if (cancelled) return;

        if (result?.verified) {
          setData(result);

          if (result.status === 'pending') {
            setPolling(true);
            void pollUntilSettled(initialEmail);
          }
        }
      } catch {
        // Fall back to the manual form below.
      } finally {
        if (!cancelled) setAutoLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialEmail, lookup, pollUntilSettled, reference]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const address = email.trim();
    setBusy(true);
    setMessage('');

    try {
      const result = await lookup(address);

      if (!result?.verified) {
        setData(null);
        setMessage('We could not match that email to this reference. Please check it and try again.');
        return;
      }

      setData(result);

      if (result.status === 'pending') {
        setPolling(true);
        void pollUntilSettled(address);
      }
    } catch {
      setMessage('We could not check that right now. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const payBalance = async () => {
    if (payBusy || !data) return;

    setPayBusy(true);
    setPayError('');

    try {
      const response = await fetch('/api/academy/enrolments/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: data.reference,
          email: data.student?.email || email.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPayError(result.error || 'We could not start the balance payment. Please try again.');
        return;
      }

      if (result.nothingDue) {
        setPayError(result.message || 'Nothing outstanding — this enrolment is settled.');
        return;
      }

      if (!result.authorizationUrl) {
        setPayError('Payment could not be opened. Please try again or email hello@wemray.com.');
        return;
      }

      window.location.assign(result.authorizationUrl);
    } catch {
      setPayError('We could not reach the server. Check your connection and try again.');
    } finally {
      setPayBusy(false);
    }
  };

  let tone = 'neutral';
  let title = 'Check your enrolment';

  if (initialStatus === 'failed') {
    tone = 'bad';
    title = 'That payment did not go through.';
  } else if (initialStatus === 'mismatch') {
    tone = 'bad';
    title = 'Payment needs a review.';
  } else if (settled) {
    tone = 'ok';
    title = 'You are enrolled.';
  } else if (data) {
    tone = 'wait';
    title = 'Confirming your payment…';
  }

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

        <div className={`es-card es-${tone}`}>
          <div className="es-ic" aria-hidden="true">
            {settled ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 5 5L20 7" />
              </svg>
            ) : tone === 'bad' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : (
              <Spinner />
            )}
          </div>

          <h1>{title}</h1>

          {reference ? (
            <p className="es-ref">
              Reference <b>{reference}</b>
            </p>
          ) : null}

          {initialStatus === 'failed' ? (
            <p className="es-note">
              No money was taken. You can try again from the course page, or contact the academy team if your bank shows
              a pending charge.
            </p>
          ) : null}

          {initialStatus === 'mismatch' ? (
            <p className="es-note">
              The amount received did not match the order, so we have paused confirmation. Our team will review it and
              contact you within one working day.
            </p>
          ) : null}

          {!data && autoLoading ? (
            <p className="es-polling" aria-live="polite">
              <Spinner />
              Loading your enrolment…
            </p>
          ) : null}

          {!data && !autoLoading ? (
            <form className="es-form" onSubmit={onSubmit}>
              <p className="es-lead">
                Enter the email address you used at checkout and we will pull up the current status.
              </p>
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
              <button className="btn pur" type="submit" disabled={busy}>
                {busy ? 'Checking…' : 'Check status'}
              </button>
              {message ? (
                <p className="es-error" role="alert">
                  {message}
                </p>
              ) : null}
            </form>
          ) : null}

          {data ? (
            <>
              <dl className="es-facts">
                <div>
                  <dt>Course</dt>
                  <dd>{data.course?.title}</dd>
                </div>
                <div>
                  <dt>Student</dt>
                  <dd>{data.student?.name}</dd>
                </div>
                <div>
                  <dt>Plan</dt>
                  <dd>{data.plan === 'installment' ? '2 instalments' : 'Full payment'}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{data.totalLabel}</dd>
                </div>
                {data.discountLabel ? (
                  <div>
                    <dt>Discount</dt>
                    <dd>
                      {data.discountLabel}
                      {data.couponCode ? ` (${data.couponCode})` : ''}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>Paid</dt>
                  <dd>{data.paidLabel}</dd>
                </div>
                {data.balanceKobo > 0 ? (
                  <div>
                    <dt>Balance</dt>
                    <dd>{data.balanceLabel}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Status</dt>
                  <dd className={`es-status es-status-${data.status}`}>{STATUS_COPY[data.status] || data.status}</dd>
                </div>
              </dl>

              {polling ? (
                <p className="es-polling" aria-live="polite">
                  <Spinner />
                  Waiting for Paystack to confirm. This usually takes a few seconds.
                </p>
              ) : null}

              {settled ? (
                <p className="es-note ok">
                  A confirmation email with your course details is on its way to {data.student?.email}. If it has not
                  arrived in a few minutes, check your spam folder.
                </p>
              ) : null}

              {payError ? (
                <p className="es-error" role="alert">
                  {payError}
                </p>
              ) : null}

              <div className="es-actions">
                {data.plan === 'installment' && data.balanceKobo > 0 ? (
                  <button className="btn pur" type="button" onClick={payBalance} disabled={payBusy}>
                    {payBusy ? 'Opening secure checkout…' : `Pay balance ${data.balanceLabel}`}
                  </button>
                ) : null}
                <Link className="btn line" href={`/academy/courses/${data.course?.slug}`}>
                  View course
                </Link>
                <Link className="btn soft" href="/academy">
                  All courses
                </Link>
              </div>
            </>
          ) : null}
        </div>

        <p className="es-help">
          Something wrong? Email{' '}
          <a href={`mailto:hello@wemray.com?subject=Enrolment%20${encodeURIComponent(reference || '')}`}>
            hello@wemray.com
          </a>{' '}
          with your reference and we will sort it out.
        </p>
      </div>
    </section>
  );
}

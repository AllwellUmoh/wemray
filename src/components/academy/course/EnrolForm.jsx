'use client';

import { useMemo, useState } from 'react';
import { computeTotals, formatNaira } from '../../../lib/academy/pricing';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function EnrolForm({ course }) {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    note: '',
    website: '',
  });
  const [plan, setPlan] = useState('full');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const set = (key) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const totals = useMemo(() => {
    const computed = computeTotals({
      priceKobo: course.priceKobo,
      coupon: coupon ? { percent_off: coupon.percentOff } : null,
      plan,
    });

    return {
      base: computed.baseKobo,
      discount: computed.discountKobo,
      total: computed.totalKobo,
      first: computed.instalments[0] || 0,
      second: computed.instalments[1] || 0,
    };
  }, [course.priceKobo, coupon, plan]);

  const payableNow = plan === 'installment' ? totals.first : totals.total;
  const balance = plan === 'installment' ? totals.second : 0;

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      setCoupon(null);
      setCouponMessage('Enter a code first.');
      return;
    }

    setCouponBusy(true);
    setCouponMessage('');

    try {
      const response = await fetch('/api/academy/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: course.slug, code }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.valid) {
        setCoupon(null);
        setCouponMessage(result.error || 'That code is not valid for this course.');
        return;
      }

      setCoupon({ code: result.code, percentOff: result.percentOff, label: result.label });
      setCouponMessage(`${result.percentOff}% off applied — you save ${formatNaira(result.discountKobo)}.`);
    } catch {
      setCoupon(null);
      setCouponMessage('We could not check that code. Please try again.');
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'submitting') return;

    const errors = {};
    if (!values.firstName.trim()) errors.firstName = 'Please enter your first name.';
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (values.phone.trim().length < 7) {
      errors.phone = 'Please enter a phone number we can reach you on.';
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setError('Please check the highlighted fields.');
      return;
    }

    setStatus('submitting');
    setError('');

    try {
      const response = await fetch('/api/academy/enrolments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: course.slug,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          plan,
          coupon: coupon?.code || '',
          note: values.note.trim(),
          website: values.website,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setStatus('idle');
        setError(result.error || 'We could not start your payment. Please try again.');
        return;
      }

      if (!result.authorizationUrl) {
        setStatus('idle');
        setError('Payment could not be opened. Please try again or email hello@wemray.com.');
        return;
      }

      // Hand off to Paystack's hosted checkout.
      window.location.assign(result.authorizationUrl);
    } catch {
      setStatus('idle');
      setError('We could not reach the server. Check your connection and try again.');
    }
  };

  const submitting = status === 'submitting';

  return (
    <form className="en-form" id="enrol" onSubmit={handleSubmit} noValidate>
      <header className="en-head">
        <p className="ab-eb"><i />Enrol</p>
        <h2>Reserve your place</h2>
        <p>
          Pay with card, transfer or USSD. You&rsquo;ll get a confirmation email the moment payment clears.
        </p>
      </header>

      <div className="en-fields">
        <label className={`fld${fieldErrors.email ? ' bad' : ''}`}>
          <input
            name="email"
            type="email"
            placeholder=" "
            autoComplete="email"
            value={values.email}
            onChange={set('email')}
            aria-invalid={Boolean(fieldErrors.email)}
            required
          />
          <span>Email address <em>*</em></span>
          <small className="err">{fieldErrors.email || 'Please enter a valid email address.'}</small>
        </label>

        <div className="en-row">
          <label className={`fld${fieldErrors.firstName ? ' bad' : ''}`}>
            <input
              name="firstName"
              type="text"
              placeholder=" "
              autoComplete="given-name"
              value={values.firstName}
              onChange={set('firstName')}
              aria-invalid={Boolean(fieldErrors.firstName)}
              required
            />
            <span>First name <em>*</em></span>
            <small className="err">{fieldErrors.firstName || 'Please enter your first name.'}</small>
          </label>

          <label className="fld">
            <input
              name="lastName"
              type="text"
              placeholder=" "
              autoComplete="family-name"
              value={values.lastName}
              onChange={set('lastName')}
            />
            <span>Last name <i>Optional</i></span>
          </label>
        </div>

        <label className={`fld${fieldErrors.phone ? ' bad' : ''}`}>
          <input
            name="phone"
            type="tel"
            placeholder=" "
            autoComplete="tel"
            value={values.phone}
            onChange={set('phone')}
            aria-invalid={Boolean(fieldErrors.phone)}
            required
          />
          <span>Phone number <em>*</em></span>
          <small className="err">{fieldErrors.phone || 'Please enter a phone number we can reach you on.'}</small>
        </label>
      </div>

      <fieldset className="en-plans">
        <legend>Payment option</legend>
        <label className={`en-plan${plan === 'full' ? ' on' : ''}`}>
          <input
            type="radio"
            name="plan"
            value="full"
            checked={plan === 'full'}
            onChange={() => setPlan('full')}
          />
          <span className="en-plan-body">
            <b>Pay in full</b>
            <small>{formatNaira(totals.total)} today</small>
          </span>
          <span className="en-plan-amt">{formatNaira(totals.total)}</span>
        </label>

        <label className={`en-plan${plan === 'installment' ? ' on' : ''}`}>
          <input
            type="radio"
            name="plan"
            value="installment"
            checked={plan === 'installment'}
            onChange={() => setPlan('installment')}
          />
          <span className="en-plan-body">
            <b>2 instalments</b>
            <small>
              {formatNaira(totals.first)} now · {formatNaira(totals.second)} in 30 days
            </small>
          </span>
          <span className="en-plan-amt">{formatNaira(totals.first)}</span>
        </label>
      </fieldset>

      <div className="en-coupon">
        <label className="fld">
          <input
            name="coupon"
            type="text"
            placeholder=" "
            autoComplete="off"
            value={couponInput}
            onChange={(event) => {
              setCouponInput(event.target.value.toUpperCase());
              if (couponMessage && !coupon) setCouponMessage('');
            }}
            disabled={Boolean(coupon)}
          />
          <span>Coupon code <i>Optional</i></span>
        </label>
        {coupon ? (
          <button type="button" className="en-coupon-btn" onClick={removeCoupon}>
            Remove
          </button>
        ) : (
          <button type="button" className="en-coupon-btn" onClick={applyCoupon} disabled={couponBusy}>
            {couponBusy ? 'Checking…' : 'Apply'}
          </button>
        )}
      </div>
      {couponMessage ? (
        <p className={`en-coupon-note${coupon ? ' ok' : ' bad'}`} aria-live="polite">
          {couponMessage}
        </p>
      ) : (
        <p className="en-coupon-hint">Have a code? WEMRAY25 takes 25% off the training fee.</p>
      )}

      <div className="en-summary">
        <div className="en-summary-row">
          <span>Training fee</span>
          <b>{formatNaira(totals.base)}</b>
        </div>
        {totals.discount > 0 ? (
          <div className="en-summary-row">
            <span>Discount{coupon ? ` (${coupon.code})` : ''}</span>
            <b className="en-discount">−{formatNaira(totals.discount)}</b>
          </div>
        ) : null}
        <div className="en-summary-row en-summary-total">
          <span>Total</span>
          <b>{formatNaira(totals.total)}</b>
        </div>
        <div className="en-summary-row en-summary-now">
          <span>Pay now</span>
          <b>{formatNaira(payableNow)}</b>
        </div>
        {balance > 0 ? (
          <p className="en-summary-note">
            Balance of <b>{formatNaira(balance)}</b> due 30 days after today. We&rsquo;ll email a payment link.
          </p>
        ) : null}
      </div>

      <label className="ct-hp" aria-hidden="true">
        <span>Website</span>
        <input name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </label>

      {error ? <p className="en-error" role="alert">{error}</p> : null}

      <button className="btn pur btn-block en-submit" type="submit" disabled={submitting}>
        {submitting ? 'Opening secure checkout…' : `Pay ${formatNaira(payableNow)} with Paystack`}
        <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      <p className="en-secure">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="18" height="11" x="3" y="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Secured by Paystack. We never see or store your card details.
      </p>
    </form>
  );
}

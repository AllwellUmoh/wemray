'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';
import { SERVICE_OPTIONS } from '../../lib/contact-options';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function PopupIcon({ type }) {
  if (type === 'error') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export default function ContactForm({ defaults = {} }) {
  const formRef = useRef(null);
  const closeRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [fieldErrors, setFieldErrors] = useState({});
  const [popup, setPopup] = useState(null);

  const closePopup = () => setPopup(null);

  useEffect(() => {
    if (!popup) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closePopup();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [popup]);

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
    if (status === 'submitting') return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      organisation: String(data.get('org') || '').trim(),
      budget: String(data.get('budget') || '').trim(),
      service: String(data.get('service') || ''),
      details: String(data.get('details') || '').trim(),
      intent: event.nativeEvent.submitter?.dataset.intent || 'conversation',
      website: String(data.get('website') || ''),
    };

    const errors = {};
    if (!payload.name) errors.name = 'Please tell us your name.';
    if (!EMAIL_PATTERN.test(payload.email)) errors.email = 'Please enter a valid email address.';
    if (!payload.service) errors.service = 'Please choose a service.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setStatus('idle');
      setPopup({
        type: 'error',
        title: 'Please check the form.',
        message: 'Some required details are missing or invalid. Please review the highlighted fields.',
      });
      return;
    }

    setStatus('submitting');
    setFieldErrors({});

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setStatus('idle');
        setPopup({
          type: 'error',
          title: 'Message not sent.',
          message: result.error || 'We could not send your message. Please try again or email hello@wemray.com.',
        });
        return;
      }

      setStatus('idle');
      setFieldErrors({});
      formRef.current?.reset();
      setPopup({
        type: 'success',
        title: 'Message received.',
        message: `Thanks, ${payload.name}. We will reply to ${payload.email} as soon as possible.`,
        reference: result.reference,
      });
    } catch {
      setStatus('idle');
      setPopup({
        type: 'error',
        title: 'Connection problem.',
        message: 'We could not reach the server. Please check your connection and try again.',
      });
    }
  };

  return (
    <>
      <form className="ct-form" id="ctForm" ref={formRef} onSubmit={handleSubmit} noValidate>
        <i className="dots" />
        <div className="row2">
          <label className={`fld${fieldErrors.name ? ' bad' : ''}`}>
            <input
              name="name"
              type="text"
              placeholder=" "
              autoComplete="name"
              required
              onChange={() => clearError('name')}
              aria-invalid={Boolean(fieldErrors.name)}
            />
            <span>Full name <em>*</em></span>
            <small className="err">{fieldErrors.name || 'Please tell us your name.'}</small>
          </label>
          <label className={`fld${fieldErrors.email ? ' bad' : ''}`}>
            <input
              name="email"
              type="email"
              placeholder=" "
              autoComplete="email"
              required
              onChange={() => clearError('email')}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            <span>Email address <em>*</em></span>
            <small className="err">{fieldErrors.email || 'Please enter a valid email address.'}</small>
          </label>
        </div>
        <div className="row2">
          <label className="fld">
            <input name="org" type="text" placeholder=" " autoComplete="organization" />
            <span>Organisation <i>Optional</i></span>
          </label>
          <label className="fld">
            <input name="budget" type="text" placeholder=" " />
            <span>Estimated budget <i>Optional</i></span>
          </label>
        </div>
        <label className={`fld sel${fieldErrors.service ? ' bad' : ''}`}>
          <select
            name="service"
            required
            defaultValue={defaults.service || ''}
            onChange={() => clearError('service')}
            aria-invalid={Boolean(fieldErrors.service)}
          >
            <option value="" disabled hidden />
            {SERVICE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
          </select>
          <span>Service of interest</span>
          <svg className="chv" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          <small className="err">{fieldErrors.service || 'Please choose a service.'}</small>
        </label>
        <label className={`fld ta${fieldErrors.details ? ' bad' : ''}`}>
          <textarea
            name="details"
            rows={5}
            placeholder=" "
            defaultValue={defaults.details || ''}
            onChange={() => clearError('details')}
            aria-invalid={Boolean(fieldErrors.details)}
          />
          <span>Project details</span>
          <small className="err">{fieldErrors.details || 'Please add a little more detail.'}</small>
        </label>
        <label className="ct-hp" aria-hidden="true">
          <span>Website</span>
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <div className="ct-act">
          <Button variant="pur" type="submit" arrow>
            {status === 'submitting' ? 'Sending…' : 'Start a Conversation'}
          </Button>
        </div>
        <p className="ct-note" aria-live="polite">
          We will send a confirmation and reply to the email address you provide.
        </p>
      </form>

      {popup ? (
        <div className="ct-pop" role="presentation">
          <div className="ct-pop-ov" onClick={closePopup} aria-hidden="true" />
          <div
            className={`ct-pop-card${popup.type === 'error' ? ' bad' : ''}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ctPopTitle"
            aria-describedby="ctPopMsg"
          >
            <button
              type="button"
              className="ct-pop-x"
              onClick={closePopup}
              ref={closeRef}
              aria-label="Close notification"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <span className="ct-pop-ic">
              <PopupIcon type={popup.type} />
            </span>
            <h3 id="ctPopTitle">{popup.title}</h3>
            <p id="ctPopMsg">{popup.message}</p>
            {popup.reference ? (
              <p className="ct-pop-ref">
                Reference <b>{popup.reference}</b>
              </p>
            ) : null}
            <div className="ct-pop-act">
              <Button variant={popup.type === 'error' ? 'line' : 'pur'} onClick={closePopup}>
                {popup.type === 'error' ? 'Try again' : 'Done'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

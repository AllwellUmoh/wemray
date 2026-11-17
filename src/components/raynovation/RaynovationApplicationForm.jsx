'use client';

import { useMemo, useRef, useState } from 'react';
import { RAYNOVATION_TRACKS } from '../../data/raynovation-tracks';

const STEPS = [
  'Personal details',
  'Address',
  'Background',
  'Training',
  'Attestation',
];

const OCCUPATIONS = [
  'Employed - I am working for a company',
  'Self-Employed - I have my own business, working for myself',
  'Unemployed/Job searching - not working, currently looking for a job',
  'Temporary Job - I have a part-time job',
  'NYSC Corps Member - I am a serving corps member',
  'Student - I am currently in school',
];

const QUALIFICATIONS = [
  'Masters',
  'Bachelors',
  'HND',
  'OND',
  'WASSC',
  'First School Leaving Certificate',
  'None',
];

const WORK_EXPERIENCE = ['Worked Before', 'Currently Working', 'Not Worked Before'];
const YES_NO = ['Yes', 'No'];

const INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  whatsappSameAsPhone: true,
  whatsappNumber: '',
  dateOfBirth: '',
  sex: '',
  hasDisability: '',
  address: '',
  city: '',
  state: '',
  country: '',
  occupation: '',
  qualification: '',
  workExperience: '',
  computerKnowledge: '',
  trackKey: '',
  hasLaptop: '',
  hasSmartphone: '',
  availableForSessions: '',
  hasGuarantor: '',
  motivation: '',
  consent: false,
  website: '',
};

const FIELD_STEPS = {
  firstName: 0,
  lastName: 0,
  email: 0,
  phone: 0,
  whatsappNumber: 0,
  dateOfBirth: 0,
  sex: 0,
  hasDisability: 0,
  address: 1,
  city: 1,
  state: 1,
  country: 1,
  occupation: 2,
  qualification: 2,
  workExperience: 2,
  computerKnowledge: 3,
  trackKey: 3,
  hasLaptop: 4,
  hasSmartphone: 4,
  availableForSessions: 4,
  hasGuarantor: 4,
  motivation: 4,
  consent: 4,
};

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function TextField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  required = true,
  maxLength,
}) {
  return (
    <label className="rn-form-field">
      <span>{label}{required ? <em> *</em> : null}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
      />
    </label>
  );
}

function SelectField({ name, label, value, onChange, options }) {
  return (
    <label className="rn-form-field">
      <span>{label}<em> *</em></span>
      <select name={name} value={value} onChange={onChange} required>
        <option value="">Choose an option</option>
        {options.map((option) => {
          const [optionValue, optionLabel] = Array.isArray(option) ? option : [option, option];
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
        })}
      </select>
    </label>
  );
}

function ChoiceField({ name, label, value, onChange, options = YES_NO }) {
  return (
    <fieldset className="rn-choice-field">
      <legend>{label}<em> *</em></legend>
      <div className="rn-choice-options">
        {options.map((option) => (
          <label className={value === option ? 'selected' : ''} key={option}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={onChange}
              required
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function RaynovationApplicationForm({ tracks = RAYNOVATION_TRACKS }) {
  const formRef = useRef(null);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);

  const words = useMemo(() => wordCount(values.motivation), [values.motivation]);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const currentStepIsValid = () => {
    const panel = formRef.current?.querySelector(`[data-step-panel="${step}"]`);
    const invalidControl = panel?.querySelector(':invalid');
    if (!invalidControl) return true;
    invalidControl.reportValidity();
    invalidControl.focus();
    return false;
  };

  const nextStep = () => {
    if (!currentStepIsValid()) return;
    setError('');
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      nextStep();
      return;
    }
    if (!currentStepIsValid()) return;

    setStatus('submitting');
    setError('');

    try {
      const response = await fetch('/api/raynovation/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          whatsappNumber: values.whatsappSameAsPhone ? values.phone : values.whatsappNumber,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const field = Object.keys(result.fieldErrors || {})[0];
        if (field) setStep(FIELD_STEPS[field] ?? STEPS.length - 1);
        setStatus('idle');
        setError(
          (field && result.fieldErrors[field]) ||
          result.error ||
          'We could not submit your application. Please try again.',
        );
        return;
      }

      setReference(result.reference || '');
      setConfirmationSent(Boolean(result.confirmationSent));
      setStatus('success');
    } catch {
      setStatus('idle');
      setError('We could not reach the server. Check your connection and try again.');
    }
  };

  if (status === 'success') {
    return (
      <section className="rn-application-success" aria-live="polite">
        <span className="rn-success-mark" aria-hidden="true">✓</span>
        <p className="rn-form-kicker">Application received</p>
        <h2>Thank you, {values.firstName}.</h2>
        <p>Your Raynovation 1.0 application has been submitted. {confirmationSent ? `A receipt was sent to ${values.email}.` : 'Keep your application reference for your records.'}</p>
        {reference ? <p className="rn-application-reference">Reference <strong>{reference}</strong></p> : null}
        <a className="btn pur" href="/raynovation">Return to Raynovation</a>
      </section>
    );
  }

  return (
    <div className="rn-application-card">
      <div className="rn-stepper" aria-label="Application progress">
        {STEPS.map((label, index) => (
          <button
            type="button"
            key={label}
            className={index === step ? 'current' : index < step ? 'complete' : ''}
            aria-label={`Step ${index + 1}: ${label}`}
            aria-current={index === step ? 'step' : undefined}
            disabled={index > step || status === 'submitting'}
            onClick={() => {
              if (index < step) {
                setError('');
                setStep(index);
              }
            }}
          >
            <span className="rn-step-number">{index < step ? '✓' : index + 1}</span>
            <span className="rn-step-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="rn-progress-track" aria-hidden="true">
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <form ref={formRef} className="rn-application-form" onSubmit={handleSubmit} noValidate>
        <input
          className="rn-honeypot"
          type="text"
          name="website"
          value={values.website}
          onChange={update}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {step === 0 ? (
          <section className="rn-form-step" data-step-panel="0" aria-labelledby="rn-step-one-title">
            <div className="rn-form-step-heading">
              <p className="rn-form-kicker">Step 1 of 5</p>
              <h2 id="rn-step-one-title">Personal details</h2>
              <p>Tell us how to identify and reach you.</p>
            </div>
            <div className="rn-form-grid">
              <TextField name="firstName" label="First name" value={values.firstName} onChange={update} autoComplete="given-name" maxLength={80} />
              <TextField name="lastName" label="Last name" value={values.lastName} onChange={update} autoComplete="family-name" maxLength={80} />
              <TextField name="email" label="Email address" type="email" value={values.email} onChange={update} autoComplete="email" maxLength={254} />
              <TextField name="phone" label="Phone number" type="tel" value={values.phone} onChange={update} autoComplete="tel" maxLength={32} />
              <div className="rn-whatsapp-field">
                <label className="rn-form-field">
                  <span>WhatsApp number</span>
                  {values.whatsappSameAsPhone ? (
                    <input value={values.phone} readOnly aria-label="WhatsApp number, same as phone number" />
                  ) : (
                    <input
                      name="whatsappNumber"
                      type="tel"
                      value={values.whatsappNumber}
                      onChange={update}
                      autoComplete="tel"
                      maxLength={32}
                      required
                    />
                  )}
                </label>
                <label className="rn-same-number">
                  <input type="checkbox" name="whatsappSameAsPhone" checked={values.whatsappSameAsPhone} onChange={update} />
                  <span>Same as my phone number</span>
                </label>
              </div>
              <TextField name="dateOfBirth" label="Date of birth" type="date" value={values.dateOfBirth} onChange={update} />
              <SelectField name="sex" label="Sex" value={values.sex} onChange={update} options={['Female', 'Male', 'Prefer not to say']} />
              <div className="rn-form-grid-full">
                <ChoiceField name="hasDisability" label="Are you living with a disability?" value={values.hasDisability} onChange={update} />
              </div>
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="rn-form-step" data-step-panel="1" aria-labelledby="rn-step-two-title">
            <div className="rn-form-step-heading">
              <p className="rn-form-kicker">Step 2 of 5</p>
              <h2 id="rn-step-two-title">Where you live</h2>
              <p>Enter your current contact address.</p>
            </div>
            <div className="rn-form-grid">
              <div className="rn-form-grid-full">
                <TextField name="address" label="Address" value={values.address} onChange={update} autoComplete="street-address" maxLength={240} />
              </div>
              <TextField name="city" label="City" value={values.city} onChange={update} autoComplete="address-level2" maxLength={100} />
              <TextField name="state" label="State" value={values.state} onChange={update} autoComplete="address-level1" maxLength={100} />
              <TextField name="country" label="Country" value={values.country} onChange={update} autoComplete="country-name" maxLength={100} />
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="rn-form-step" data-step-panel="2" aria-labelledby="rn-step-three-title">
            <div className="rn-form-step-heading">
              <p className="rn-form-kicker">Step 3 of 5</p>
              <h2 id="rn-step-three-title">Education and experience</h2>
              <p>This helps us understand your current starting point.</p>
            </div>
            <div className="rn-form-grid">
              <SelectField name="occupation" label="Current occupation" value={values.occupation} onChange={update} options={OCCUPATIONS} />
              <SelectField name="qualification" label="Highest educational qualification" value={values.qualification} onChange={update} options={QUALIFICATIONS} />
              <div className="rn-form-grid-full">
                <SelectField name="workExperience" label="Previous work experience" value={values.workExperience} onChange={update} options={WORK_EXPERIENCE} />
              </div>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="rn-form-step" data-step-panel="3" aria-labelledby="rn-step-four-title">
            <div className="rn-form-step-heading">
              <p className="rn-form-kicker">Step 4 of 5</p>
              <h2 id="rn-step-four-title">Training information</h2>
              <p>Choose the area you are most interested in learning.</p>
            </div>
            <div className="rn-form-grid">
              <div className="rn-form-grid-full">
                <ChoiceField
                  name="computerKnowledge"
                  label="Do you have any previous computer knowledge?"
                  value={values.computerKnowledge}
                  onChange={update}
                />
              </div>
              <div className="rn-form-grid-full">
                <SelectField
                  name="trackKey"
                  label="Track"
                  value={values.trackKey}
                  onChange={update}
                  options={tracks.map((track) => [track.key, track.label])}
                />
              </div>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="rn-form-step" data-step-panel="4" aria-labelledby="rn-step-five-title">
            <div className="rn-form-step-heading">
              <p className="rn-form-kicker">Step 5 of 5</p>
              <h2 id="rn-step-five-title">Attestation and agreement</h2>
              <p>Please answer each question before submitting your application.</p>
            </div>
            <div className="rn-form-stack">
              <ChoiceField name="hasLaptop" label="Do you have a working laptop you can use for this training?" value={values.hasLaptop} onChange={update} />
              <ChoiceField name="hasSmartphone" label="Do you have a working smartphone you can use for this training?" value={values.hasSmartphone} onChange={update} />
              <ChoiceField
                name="availableForSessions"
                label="If selected, are you available to attend training sessions two times per week for two months?"
                value={values.availableForSessions}
                onChange={update}
              />
              <ChoiceField
                name="hasGuarantor"
                label="Do you have a guarantor who can vouch for your integrity and commitment to the program?"
                value={values.hasGuarantor}
                onChange={update}
              />
              <label className="rn-form-field rn-motivation-field">
                <span>Why do you want to take part in Raynovation 1.0? (50 words max)<em> *</em></span>
                <textarea
                  name="motivation"
                  rows={5}
                  value={values.motivation}
                  onChange={(event) => {
                    update(event);
                    event.target.setCustomValidity(
                      wordCount(event.target.value) > 50
                        ? 'Please keep your answer to 50 words or fewer.'
                        : '',
                    );
                  }}
                  maxLength={1200}
                  required
                />
                <small className={words > 50 ? 'over-limit' : ''} aria-live="polite">{words} / 50 words</small>
              </label>
              <label className="rn-application-consent">
                <input type="checkbox" name="consent" checked={values.consent} onChange={update} required />
                <span>
                  I confirm that the information I provided is accurate and may be used to review my Raynovation application.<em> *</em>
                  {' '}See the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
                </span>
              </label>
            </div>
          </section>
        ) : null}

        {error ? <p className="rn-application-error" role="alert">{error}</p> : null}

        <div className="rn-form-navigation">
          <button
            className="btn line"
            type="button"
            onClick={() => { setError(''); setStep((current) => Math.max(0, current - 1)); }}
            disabled={step === 0 || status === 'submitting'}
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn pur" type="button" onClick={nextStep}>Continue</button>
          ) : (
            <button className="btn pur" type="submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Submitting…' : 'Submit application'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

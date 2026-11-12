'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { saveEventAction } from '@/app/admin/(protected)/events/actions';
import { slugify } from '@/lib/slugify';

function dateValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function timeValue(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

export default function EventEditor({ event = null }) {
  const [state, formAction, pending] = useActionState(saveEventAction, null);
  const [title, setTitle] = useState(event?.title || '');
  const [flyerPreview, setFlyerPreview] = useState(event?.flyer_url || '');
  const flyerPreviewUrlRef = useRef(null);
  const [properties, setProperties] = useState(Array.isArray(event?.properties) ? event.properties : []);
  const slug = event?.title === title ? event.slug : slugify(title, title ? 'event' : '');

  useEffect(() => {
    return () => {
      if (flyerPreviewUrlRef.current) URL.revokeObjectURL(flyerPreviewUrlRef.current);
    };
  }, []);

  function chooseFlyer(eventChange) {
    const file = eventChange.target.files?.[0] || null;
    if (flyerPreviewUrlRef.current) URL.revokeObjectURL(flyerPreviewUrlRef.current);
    flyerPreviewUrlRef.current = file ? URL.createObjectURL(file) : null;
    setFlyerPreview(flyerPreviewUrlRef.current || event?.flyer_url || '');
  }

  function updateProperty(index, key, value) {
    setProperties((current) => current.map((property, propertyIndex) => (
      propertyIndex === index ? { ...property, [key]: value } : property
    )));
  }

  return (
    <form action={formAction} className="admin-form admin-editor-form" encType="multipart/form-data">
      {event ? <input type="hidden" name="event_id" value={event.id} /> : null}
      <input type="hidden" name="flyer_url" value={event?.flyer_url || ''} />
      <input type="hidden" name="properties_json" value={JSON.stringify(properties)} />
      {state?.error ? <p className="admin-notice bad" role="alert">{state.error}</p> : null}

      <section className="admin-panel admin-editor-panel">
        <div className="admin-editor-section-head">
          <div>
            <span className="admin-editor-kicker">Event details</span>
            <h2>Make the essentials clear</h2>
            <p>Published events appear on the public events page. Drafts stay private to the admin area.</p>
          </div>
          <span className={`status ${event?.status === 'published' ? 'status-paid' : 'status-archived'}`}>
            {event?.status || 'New event'}
          </span>
        </div>

        <div className="admin-editor-grid">
          <label className="admin-field admin-field-wide">
            Event title
            <input
              name="title"
              value={title}
              onChange={(change) => setTitle(change.target.value)}
              maxLength={200}
              required
            />
          </label>
          <label className="admin-field">
            Event URL slug
            <input
              value={slug}
              readOnly
              placeholder="event-title"
            />
            <small>Generated from the title. The public page is /events/{slug || '…'}. Old links redirect after a title change.</small>
          </label>
          <label className="admin-field">
            Event type
            <input name="event_type" defaultValue={event?.event_type || ''} maxLength={100} placeholder="Workshop, webinar, conference…" />
          </label>
          <label className="admin-field">
            Date
            <input name="event_date" type="date" defaultValue={dateValue(event?.event_date)} required />
          </label>
          <label className="admin-field">
            Start time
            <input name="start_time" type="time" defaultValue={timeValue(event?.start_time)} required />
          </label>
          <label className="admin-field">
            End time
            <input name="end_time" type="time" defaultValue={timeValue(event?.end_time)} />
          </label>
          <label className="admin-field">
            Time zone
            <input name="timezone" defaultValue={event?.timezone || 'Africa/Lagos'} maxLength={80} placeholder="Africa/Lagos" required />
            <small>Use an IANA time zone such as Africa/Lagos or Europe/London.</small>
          </label>
          <label className="admin-field admin-field-wide">
            Venue or format
            <input name="venue" defaultValue={event?.venue || ''} maxLength={500} placeholder="Wemray Studio, Port Harcourt or Online" required />
          </label>
          <label className="admin-field admin-field-wide">
            Registration link
            <input name="registration_url" type="url" defaultValue={event?.registration_url || ''} maxLength={2000} placeholder="https://…" />
            <small>Leave blank if registration is not open yet.</small>
          </label>
          <label className="admin-field admin-field-wide">
            Description
            <textarea name="description" defaultValue={event?.description || ''} maxLength={10000} rows={6} required />
          </label>
          <label className="admin-field admin-field-wide">
            Event flyer image
            <input
              name="flyer_file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={chooseFlyer}
            />
            <small>Upload a JPG, PNG, or WebP up to 3 MB. Leave this empty to keep the current flyer.</small>
          </label>
        </div>

        {flyerPreview ? (
          <div className="admin-flyer-preview">
            <span>Flyer preview</span>
            <Image unoptimized src={flyerPreview} alt="Event flyer preview" width={640} height={400} />
          </div>
        ) : null}

        <div className="admin-editor-options">
          <label className="admin-field">
            Visibility
            <select name="status" defaultValue={event?.status || 'draft'}>
              <option value="draft">Draft — only admins can see it</option>
              <option value="published">Published — visible on the website</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="admin-check admin-publish-check">
            <input type="checkbox" name="featured" defaultChecked={Boolean(event?.featured)} />
            <span>Feature this event at the top of the events page</span>
          </label>
        </div>
      </section>

      <section className="admin-panel admin-editor-panel">
        <div className="admin-editor-section-head">
          <div>
            <span className="admin-editor-kicker">More information</span>
            <h2>Other event properties</h2>
            <p>Add any extra details such as audience, price, capacity, speakers, or what to bring.</p>
          </div>
          <button
            className="admin-button admin-button-soft"
            type="button"
            onClick={() => setProperties((current) => [...current, { label: '', value: '' }])}
          >
            Add detail
          </button>
        </div>
        {properties.length ? (
          <div className="admin-event-property-list">
            {properties.map((property, index) => (
              <div className="admin-event-property" key={index}>
                <label className="admin-field">
                  Detail name
                  <input value={property.label || ''} onChange={(change) => updateProperty(index, 'label', change.target.value)} maxLength={80} placeholder="Audience" />
                </label>
                <label className="admin-field">
                  Detail value
                  <input value={property.value || ''} onChange={(change) => updateProperty(index, 'value', change.target.value)} maxLength={500} placeholder="Founders and small teams" />
                </label>
                <button className="admin-property-remove" type="button" onClick={() => setProperties((current) => current.filter((_, propertyIndex) => propertyIndex !== index))}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-empty admin-inline-empty">No additional details yet.</p>
        )}
      </section>

      <div className="admin-editor-footer">
        <Link className="admin-button admin-button-quiet" href="/admin/events">Back to events</Link>
        <button className="admin-button admin-button-primary" type="submit" disabled={pending}>
          {pending ? 'Saving event…' : event ? 'Save event changes' : 'Create event'}
        </button>
      </div>
    </form>
  );
}

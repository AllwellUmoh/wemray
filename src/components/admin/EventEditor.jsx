'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { saveEventAction } from '@/app/admin/(protected)/events/actions';

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

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
  const [slug, setSlug] = useState(event?.slug || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(event?.slug));
  const [flyerUrl, setFlyerUrl] = useState(event?.flyer_url || '');
  const [properties, setProperties] = useState(Array.isArray(event?.properties) ? event.properties : []);
  const flyerPreviewable =
    (flyerUrl.startsWith('/') && !flyerUrl.startsWith('//')) || /^https?:\/\//i.test(flyerUrl);

  function updateProperty(index, key, value) {
    setProperties((current) => current.map((property, propertyIndex) => (
      propertyIndex === index ? { ...property, [key]: value } : property
    )));
  }

  return (
    <form action={formAction} className="admin-form admin-editor-form">
      {event ? <input type="hidden" name="event_id" value={event.id} /> : null}
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
              onChange={(change) => {
                setTitle(change.target.value);
                if (!slugTouched) setSlug(slugify(change.target.value));
              }}
              maxLength={200}
              required
            />
          </label>
          <label className="admin-field">
            Event URL slug
            <input
              name="slug"
              value={slug}
              onChange={(change) => {
                setSlugTouched(true);
                setSlug(slugify(change.target.value));
              }}
              maxLength={120}
              required
            />
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
            Flyer image URL
            <input
              name="flyer_url"
              value={flyerUrl}
              onChange={(change) => setFlyerUrl(change.target.value)}
              maxLength={2000}
              placeholder="https://… or /images/event-flyer.jpg"
            />
            <small>Use a public image URL or an image already in the site’s public folder.</small>
          </label>
        </div>

        {flyerPreviewable ? (
          <div className="admin-flyer-preview">
            <span>Flyer preview</span>
            {/* Event flyers can be supplied from the website or any public image host. */}
            <Image unoptimized src={flyerUrl} alt="Event flyer preview" width={640} height={400} />
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

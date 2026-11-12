'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { createTrackInlineAction } from '@/app/admin/(protected)/tracks/actions';
import { saveCourseAction } from '@/app/admin/(protected)/courses/actions';
import { slugify } from '@/lib/slugify';

const FORMATS = ['Online', 'Onsite', 'Hybrid'];
const DELIVERY = ['Weekday', 'Weekend'];

function moneyValue(priceKobo) {
  const amount = Number(priceKobo || 0) / 100;
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
}

function mapModule(module, index) {
  return {
    number: module.number || String(index + 1).padStart(2, '0'),
    title: module.title || '',
    summary: module.summary || '',
    topicsText: Array.isArray(module.topics) ? module.topics.join('\n') : '',
  };
}

export default function CourseEditor({ course = null, tracks = [] }) {
  const [state, formAction, pending] = useActionState(saveCourseAction, null);
  const [availableTracks, setAvailableTracks] = useState(tracks);
  const [title, setTitle] = useState(course?.title || '');
  const [trackKey, setTrackKey] = useState(course?.track_key || tracks[0]?.key || '');
  const [modules, setModules] = useState((course?.modules || []).map(mapModule));
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [trackState, setTrackState] = useState(null);
  const [trackPending, startTrackTransition] = useTransition();
  const trackDialogRef = useRef(null);
  const selectedFormats = course?.formats || ['Online'];
  const selectedDelivery = course?.delivery || ['Weekday'];
  const slug = course?.title === title ? course.slug : slugify(title, title ? 'course' : '');

  useEffect(() => {
    const dialog = trackDialogRef.current;
    if (!dialog) return;
    if (trackDialogOpen && !dialog.open) dialog.showModal();
    if (!trackDialogOpen && dialog.open) dialog.close();
  }, [trackDialogOpen]);

  function addTrack(event) {
    event.preventDefault();
    const modalForm = event.currentTarget;
    const formData = new FormData(modalForm);
    setTrackState(null);
    startTrackTransition(async () => {
      const result = await createTrackInlineAction(formData);
      if (result?.error) {
        setTrackState(result);
        return;
      }
      if (!result?.track) {
        setTrackState({ error: 'The track could not be added. Please try again.' });
        return;
      }
      setAvailableTracks((current) => [...current, result.track].sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)));
      setTrackKey(result.track.key);
      modalForm.reset();
      setTrackDialogOpen(false);
    });
  }

  function updateModule(index, key, value) {
    setModules((current) => current.map((module, moduleIndex) => (
      moduleIndex === index ? { ...module, [key]: value } : module
    )));
  }

  function moveModule(index, direction) {
    setModules((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <>
    <form action={formAction} className="admin-form admin-editor-form">
      {course ? <input type="hidden" name="course_id" value={course.id} /> : null}
      <input type="hidden" name="modules_json" value={JSON.stringify(modules)} />

      {state?.error ? <p className="admin-notice bad" role="alert">{state.error}</p> : null}

      <section className="admin-panel admin-editor-panel">
        <div className="admin-editor-section-head">
          <div>
            <span className="admin-editor-kicker">Course details</span>
            <h2>What learners will see</h2>
          </div>
          <span className={`status ${course?.is_active ? 'status-paid' : 'status-archived'}`}>
            {course ? (course.is_active ? 'Live' : 'Hidden') : 'New course'}
          </span>
        </div>

        <div className="admin-editor-grid">
          <label className="admin-field admin-field-wide">
            Course title
            <input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
            />
          </label>
          <label className="admin-field">
            Course URL slug
            <input
              value={slug}
              readOnly
              placeholder="course-title"
            />
            <small>Generated from the title. The public page is /academy/courses/{slug || '…'}. Old links redirect after a title change.</small>
          </label>
          <label className="admin-field">
            Course number
            <input value={course?.number || 'Assigned when saved'} readOnly />
            <small>{course ? 'Assigned automatically and kept with this course.' : 'The next number is automatic; new courses appear first in the Academy.'}</small>
          </label>
          <div className="admin-field">
            <label htmlFor="course-track">Track</label>
            <div className="admin-track-select-row">
              <select id="course-track" name="track_key" value={trackKey} onChange={(event) => setTrackKey(event.target.value)} required>
              <option value="" disabled>Select a track</option>
              {availableTracks.map((track) => <option key={track.key} value={track.key}>{track.label}</option>)}
              </select>
              <button className="admin-track-add" type="button" onClick={() => { setTrackState(null); setTrackDialogOpen(true); }} aria-label="Add a course track" title="Add a course track">+</button>
            </div>
            <small>Manage all learning paths on the <Link href="/admin/tracks">tracks page</Link>.</small>
          </div>
          <label className="admin-field">
            Course fee (NGN)
            <input
              name="price_naira"
              type="number"
              min="0"
              step="0.01"
              defaultValue={moneyValue(course?.price_kobo)}
              required
            />
          </label>
          <label className="admin-field">
            Duration
            <input name="duration" defaultValue={course?.duration || ''} maxLength={120} placeholder="10 weeks" required />
          </label>
          <label className="admin-field">
            Class schedule
            <input name="classes" defaultValue={course?.classes || ''} maxLength={160} placeholder="3 classes/week · 2 hrs each" required />
          </label>
          <label className="admin-field">
            Certificate
            <input name="certificate" defaultValue={course?.certificate || 'Certificate of completion'} maxLength={200} required />
          </label>
          <label className="admin-field">
            Card image URL
            <input name="image_url" type="text" defaultValue={course?.image_url || ''} maxLength={2000} placeholder="https://… or /images/course.jpg" />
          </label>
          <label className="admin-field">
            Icon key
            <input name="icon" defaultValue={course?.icon || 'monitor'} maxLength={60} placeholder="monitor" />
          </label>
          <label className="admin-field admin-field-wide">
            Course description
            <textarea name="description" defaultValue={course?.description || ''} maxLength={5000} rows={4} required />
          </label>
          <label className="admin-field admin-field-wide">
            Learner outcome
            <textarea name="outcome" defaultValue={course?.outcome || ''} maxLength={5000} rows={4} />
          </label>
        </div>

        <div className="admin-editor-options">
          <fieldset className="admin-option-set">
            <legend>Class format</legend>
            <div className="admin-checks">
              {FORMATS.map((format) => (
                <label key={format} className="admin-check">
                  <input type="checkbox" name="formats" value={format} defaultChecked={selectedFormats.includes(format)} />
                  <span>{format}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="admin-option-set">
            <legend>Schedule</legend>
            <div className="admin-checks">
              {DELIVERY.map((day) => (
                <label key={day} className="admin-check">
                  <input type="checkbox" name="delivery" value={day} defaultChecked={selectedDelivery.includes(day)} />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="admin-check admin-publish-check">
            <input type="checkbox" name="is_active" defaultChecked={course ? course.is_active : true} />
            <span>Publish this course on the Academy page</span>
          </label>
        </div>
      </section>

      <section className="admin-panel admin-editor-panel">
        <div className="admin-editor-section-head">
          <div>
            <span className="admin-editor-kicker">Learning plan</span>
            <h2>Course modules</h2>
            <p>Add, reorder, or remove modules. Each topic appears in the module outline.</p>
          </div>
          <button
            className="admin-button admin-button-soft"
            type="button"
            onClick={() => setModules((current) => {
              const highestNumber = current.reduce((highest, module) => {
                const numeric = Number.parseInt(module.number, 10);
                return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
              }, 0);
              return [...current, mapModule({ number: String(highestNumber + 1).padStart(2, '0') }, current.length)];
            })}
          >
            Add module
          </button>
        </div>

        {modules.length ? (
          <div className="admin-module-list">
            {modules.map((module, index) => (
              <fieldset className="admin-module-card" key={`${module.number}-${index}`}>
                <legend>Module {String(index + 1).padStart(2, '0')}</legend>
                <div className="admin-module-actions">
                  <button type="button" onClick={() => moveModule(index, -1)} disabled={index === 0} aria-label="Move module up">↑</button>
                  <button type="button" onClick={() => moveModule(index, 1)} disabled={index === modules.length - 1} aria-label="Move module down">↓</button>
                  <button type="button" onClick={() => setModules((current) => current.filter((_, moduleIndex) => moduleIndex !== index))} aria-label="Remove module">Remove</button>
                </div>
                <div className="admin-editor-grid">
                  <label className="admin-field">
                    Module number
                    <input value={module.number} onChange={(event) => updateModule(index, 'number', event.target.value)} maxLength={20} />
                  </label>
                  <label className="admin-field admin-field-wide">
                    Module title
                    <input value={module.title} onChange={(event) => updateModule(index, 'title', event.target.value)} maxLength={200} required />
                  </label>
                  <label className="admin-field admin-field-wide">
                    Summary
                    <textarea value={module.summary} onChange={(event) => updateModule(index, 'summary', event.target.value)} maxLength={2000} rows={2} />
                  </label>
                  <label className="admin-field admin-field-wide">
                    Topics (one per line)
                    <textarea value={module.topicsText} onChange={(event) => updateModule(index, 'topicsText', event.target.value)} rows={4} placeholder={'Research and planning\nPractical workshop\nPortfolio project'} />
                  </label>
                </div>
              </fieldset>
            ))}
          </div>
        ) : (
          <p className="admin-empty admin-inline-empty">No modules yet. Add one when the learning plan is ready.</p>
        )}
      </section>

      <div className="admin-editor-footer">
        <Link className="admin-button admin-button-quiet" href="/admin/courses">Back to courses</Link>
        <button className="admin-button admin-button-primary" type="submit" disabled={pending}>
          {pending ? 'Saving course…' : course ? 'Save course changes' : 'Create course'}
        </button>
      </div>
    </form>

    <dialog
      className="admin-modal"
      ref={trackDialogRef}
      onCancel={(event) => { event.preventDefault(); setTrackDialogOpen(false); }}
    >
      <form onSubmit={addTrack}>
        <div className="admin-modal-head">
          <div><span className="admin-editor-kicker">New learning path</span><h2>Add a track</h2></div>
          <button type="button" className="admin-modal-close" onClick={() => setTrackDialogOpen(false)} aria-label="Close track form">×</button>
        </div>
        {trackState?.error ? <p className="admin-notice bad" role="alert">{trackState.error}</p> : null}
        <label className="admin-field">
          Track name
          <input name="label" maxLength={160} placeholder="e.g. Data & Analytics" required autoFocus />
          <small>The track URL key is generated automatically from its name.</small>
        </label>
        <label className="admin-field">
          Description
          <textarea name="description" maxLength={3000} rows={3} placeholder="A short description of this learning path" />
        </label>
        <label className="admin-field">
          Display order
          <input name="sort_order" type="number" min="0" max="1000000" defaultValue="0" />
        </label>
        <div className="admin-modal-actions">
          <button className="admin-button admin-button-quiet" type="button" onClick={() => setTrackDialogOpen(false)}>Cancel</button>
          <button className="admin-button admin-button-primary" type="submit" disabled={trackPending}>{trackPending ? 'Adding track…' : 'Add track'}</button>
        </div>
      </form>
    </dialog>
    </>
  );
}

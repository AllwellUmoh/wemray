'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { saveTrackAction } from '@/app/admin/(protected)/tracks/actions';

export default function TrackEditor({ track = null }) {
  const [state, formAction, pending] = useActionState(saveTrackAction, null);

  return (
    <form action={formAction} className="admin-form admin-editor-form">
      {track ? <input type="hidden" name="track_key" value={track.key} /> : null}
      {state?.error ? <p className="admin-notice bad" role="alert">{state.error}</p> : null}
      <section className="admin-panel admin-editor-panel">
        <div className="admin-editor-section-head">
          <div>
            <span className="admin-editor-kicker">Academy track</span>
            <h2>{track ? 'Update this learning path' : 'Create a learning path'}</h2>
            <p>Courses use tracks to group related skills in the Academy catalogue.</p>
          </div>
        </div>
        <div className="admin-editor-grid">
          <label className="admin-field admin-field-wide">
            Track name
            <input name="label" defaultValue={track?.label || ''} maxLength={160} required autoFocus />
            <small>{track ? `URL key stays stable: ${track.key}` : 'A short URL key is generated from this name.'}</small>
          </label>
          <label className="admin-field">
            Display order
            <input name="sort_order" type="number" min="0" max="1000000" defaultValue={track?.sort_order ?? 0} />
          </label>
          <label className="admin-field admin-field-wide">
            Description
            <textarea name="description" defaultValue={track?.description || ''} maxLength={3000} rows={4} />
          </label>
        </div>
      </section>
      <div className="admin-editor-footer">
        <Link className="admin-button admin-button-quiet" href="/admin/tracks">Back to tracks</Link>
        <button className="admin-button admin-button-primary" type="submit" disabled={pending}>
          {pending ? 'Saving track…' : track ? 'Save track changes' : 'Create track'}
        </button>
      </div>
    </form>
  );
}

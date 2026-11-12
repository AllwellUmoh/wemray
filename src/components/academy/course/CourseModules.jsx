'use client';

import { useState } from 'react';

export default function CourseModules({ modules = [], courseTitle }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!modules.length) {
    return (
      <section className="cd-modules">
        <p className="ab-eb"><i />Curriculum</p>
        <h2>Modules</h2>
        <p className="cd-modules-note">
          The module breakdown for {courseTitle} is being finalised. Contact the academy team for the current outline.
        </p>
      </section>
    );
  }

  return (
    <section className="cd-modules" id="modules">
      <p className="ab-eb"><i />Curriculum</p>
      <h2>{modules.length} modules · {courseTitle}</h2>
      <p className="cd-modules-lead">
        Each module runs for one to two weeks and ends with a small piece of work you keep. Later modules build on
        earlier ones, so the order matters.
      </p>

      <ol className="cd-mod-list">
        {modules.map((module, index) => {
          const open = openIndex === index;
          return (
            <li className={`cd-mod${open ? ' open' : ''}`} key={module.id || module.number}>
              <button
                type="button"
                className="cd-mod-hd"
                aria-expanded={open}
                aria-controls={`cd-mod-${index}`}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                <span className="cd-mod-num">{module.number}</span>
                <span className="cd-mod-title">
                  <b>{module.title}</b>
                  {module.summary ? <small>{module.summary}</small> : null}
                </span>
                <span className="cd-mod-toggle" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>

              <div className="cd-mod-body" id={`cd-mod-${index}`} hidden={!open}>
                {module.topics.length ? (
                  <ul className="cd-mod-topics">
                    {module.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Topics for this module are confirmed in class.</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

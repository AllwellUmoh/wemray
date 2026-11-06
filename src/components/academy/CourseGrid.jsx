'use client';

import { useMemo, useState } from 'react';
import Button from '../ui/Button';
import CourseCard from './CourseCard';
import { courses, trackCounts } from '../../data/courses';

export default function CourseGrid() {
  const [active, setActive] = useState('all');

  const visible = useMemo(
    () => (active === 'all' ? courses : courses.filter((course) => course.trackKey === active)),
    [active],
  );

  const activeLabel = trackCounts.find((track) => track.key === active)?.label ?? '';

  return (
    <>
      <div className="filter-row" role="group" aria-label="Filter courses by track">
        {trackCounts.map((track) => (
          <Button
            key={track.key}
            variant="filter"
            size="sm"
            pill
            active={active === track.key}
            onClick={() => setActive(track.key)}
          >
            {track.label}
            <span>{track.count}</span>
          </Button>
        ))}
      </div>
      <p className="course-filters-note" aria-live="polite">
        {active === 'all'
          ? `Showing all ${visible.length} courses`
          : `Showing ${visible.length} ${visible.length === 1 ? 'course' : 'courses'} in ${activeLabel}`}
      </p>
      <div className="course-grid">
        {visible.map((course, index) => (
          <CourseCard key={course.slug} course={course} index={index} />
        ))}
      </div>
    </>
  );
}

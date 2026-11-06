'use client';

import { useMemo, useState } from 'react';
import Button from '../ui/Button';
import CaseStudyModal from './CaseStudyModal';
import ProjectCard from './ProjectCard';
import { projectCategories, projects } from '../../data/projects';

export default function PortfolioGrid() {
  const [filter, setFilter] = useState('All');
  const [activeSlug, setActiveSlug] = useState(null);

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((project) => project.category === filter)),
    [filter],
  );

  const activeIndex = visible.findIndex((project) => project.slug === activeSlug);
  const active = activeIndex >= 0 ? visible[activeIndex] : null;

  const step = (direction) => {
    if (!visible.length) return;
    const next = (activeIndex + direction + visible.length) % visible.length;
    setActiveSlug(visible[next].slug);
  };

  return (
    <>
      <div className="pf-hd">
        <div className="pf-f" role="group" aria-label="Filter projects">
          {projectCategories.map((category) => (
            <Button
              key={category}
              variant="filter"
              size="sm"
              pill
              active={filter === category}
              onClick={() => {
                setFilter(category);
                setActiveSlug(null);
              }}
            >
              {category}
              <span>{category === 'All' ? projects.length : projects.filter((project) => project.category === category).length}</span>
            </Button>
          ))}
        </div>
        <p className="pf-note">
          {filter === 'All'
            ? `Showing all ${visible.length} projects`
            : `Showing ${visible.length} ${visible.length === 1 ? 'project' : 'projects'} in ${filter}`}
        </p>
      </div>
      <div className="pf-grid" key={filter}>
        {visible.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={index}
            onOpen={() => setActiveSlug(project.slug)}
          />
        ))}
      </div>
      {active ? (
        <CaseStudyModal
          project={active}
          index={activeIndex}
          total={visible.length}
          onClose={() => setActiveSlug(null)}
          onPrevious={() => step(-1)}
          onNext={() => step(1)}
        />
      ) : null}
    </>
  );
}

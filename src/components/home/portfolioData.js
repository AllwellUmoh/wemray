import { projects } from '../../data/projects';

export const PROJECTS = projects.map((project) => ({
  c: project.categoryLabel,
  n: project.title,
  d: project.summary,
  image: project.image,
}));

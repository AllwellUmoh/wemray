'use client';

import useAboutEffects from '../../hooks/useAboutEffects';
import useHomeEffects from '../../hooks/useHomeEffects';
import useServiceDetailEffects from '../../hooks/useServiceDetailEffects';
import useServicesEffects from '../../hooks/useServicesEffects';

export function HomeEffects() {
  useHomeEffects();
  return null;
}

export function AboutEffects() {
  useAboutEffects();
  return null;
}

export function ServicesEffects() {
  useServicesEffects();
  return null;
}

export function ServiceDetailEffects() {
  useServiceDetailEffects();
  return null;
}

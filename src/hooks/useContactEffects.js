import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { courses } from '../data/courses';

const SERVICE_VALUES = {
  branding: 'Corporate & Event Branding',
  website: 'Website Development',
  saas: 'SaaS Product Development',
  mobile: 'Mobile App Development',
  software: 'Custom Software & Business Systems',
  ai: 'AI Solutions & Intelligent Agents',
  automation: 'Workflow Automation',
  seo: 'SEO',
};

export default function useContactEffects() {
  const { search } = useLocation();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const faqs = [...document.querySelectorAll('.fq')];

    const toggle = (event) => {
      const current = event.currentTarget;
      if (!current.open) return;
      faqs.forEach((faq) => {
        if (faq !== current) faq.open = false;
      });
    };

    faqs.forEach((faq) => faq.addEventListener('toggle', toggle, { signal }));

    const form = document.getElementById('ctForm');
    const success = document.getElementById('ctOk');
    const again = document.getElementById('ctAgain');

    if (form && success) {
      const submitButtons = [...form.querySelectorAll('button[type="submit"]')];
      const fields = [...form.querySelectorAll('.fld input, .fld select')];
      let intent = 'conversation';

      const markBad = (field) => {
        field?.closest?.('.fld')?.classList.add('bad');
      };

      const clearBad = (event) => {
        event.currentTarget.closest('.fld')?.classList.remove('bad');
      };

      submitButtons.forEach((button) => {
        button.addEventListener(
          'click',
          () => {
            intent = button.dataset.intent || 'conversation';
          },
          { signal },
        );
      });

      fields.forEach((field) => {
        field.addEventListener('input', clearBad, { signal });
        field.addEventListener('change', clearBad, { signal });
      });

      const submit = (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get('name') || '').trim();
        const email = String(data.get('email') || '').trim();
        const nameField = form.elements.namedItem('name');
        const emailField = form.elements.namedItem('email');
        let invalid = false;

        if (!name) {
          markBad(nameField);
          invalid = true;
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          markBad(emailField);
          invalid = true;
        }
        if (invalid) {
          form.querySelector('.fld.bad input')?.focus();
          return;
        }

        const service = data.get('service') || 'Not specified';
        const subject = `${intent === 'consultation' ? 'Consultation request' : 'New enquiry'} | ${service}`;
        const body = `Name: ${name}\nEmail: ${email}\nOrganisation: ${data.get('org') || '-'}\nService of interest: ${service}\nEstimated budget: ${data.get('budget') || '-'}\n\nProject details:\n${data.get('details') || '-'}`;

        window.location.href = `mailto:hello@wemray.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        form.hidden = true;
        success.hidden = false;
        success.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      };

      form.addEventListener('submit', submit, { signal });

      again?.addEventListener(
        'click',
        () => {
          form.reset();
          form.querySelectorAll('.fld.bad').forEach((field) => field.classList.remove('bad'));
          success.hidden = true;
          form.hidden = false;
        },
        { signal },
      );

      if (search) {
        const params = new URLSearchParams(search);
        const serviceSlug = params.get('service');
        const courseSlug = params.get('course');
        const serviceField = form.elements.namedItem('service');
        const detailsField = form.elements.namedItem('details');

        if (serviceField && serviceSlug && SERVICE_VALUES[serviceSlug]) {
          serviceField.value = SERVICE_VALUES[serviceSlug];
        }

        const course = courses.find((item) => item.slug === courseSlug);
        if (detailsField && course && !detailsField.value) {
          detailsField.value = `Course of interest: ${course.title} (${course.track})`;
        }
      }
    }

    return () => controller.abort();
  }, [search]);
}

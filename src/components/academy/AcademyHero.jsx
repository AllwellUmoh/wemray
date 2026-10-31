import PageHero from '../ui/PageHero';

export default function AcademyHero() {
  return (
    <PageHero
      eyebrow="Ray Academy"
      lines={[
        { t: 'Learn. Create. Build.' },
        { t: 'Turn Skills into' },
        { t: 'Meaningful Work.', fw: true },
      ]}
      sub="Practical digital skills training in Port Harcourt, Nigeria and online for people ready to turn knowledge into real work."
      primary={{ label: 'Explore Ray Academy', href: '#tracks', variant: 'lav' }}
      secondary={{ label: 'Enquire About Training', href: 'contact.html#form', variant: 'ghost' }}
      className="ac-h no-vis"
      scrollHref="#tracks"
      scrollLabel="the courses"
    />
  );
}

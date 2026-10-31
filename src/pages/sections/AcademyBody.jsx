import AcademyApproach from '../../components/academy/AcademyApproach';
import AcademyAudience from '../../components/academy/AcademyAudience';
import AcademyEnrol from '../../components/academy/AcademyEnrol';
import AcademyHero from '../../components/academy/AcademyHero';
import LearningPaths from '../../components/academy/LearningPaths';
import CTASection from '../../components/ui/CTASection';
import FaqSection from '../../components/ui/FaqSection';

const faqs = [
  {
    q: 'What courses does Ray Academy offer?',
    a: 'Frontend, backend, and full-stack development, product design, corporate branding and design, social media management, WordPress, and data analytics.',
  },
  {
    q: 'How do I find out about training fees and dates?',
    a: 'Contact Ray Academy to confirm current availability, fees, formats, durations, certification, and schedules.',
  },
  {
    q: 'Who is Ray Academy for?',
    a: 'Individuals, aspiring professionals, and organisations building practical digital capability.',
  },
  {
    q: 'How do I get started?',
    a: 'Email hello@wemray.com or use the contact form to describe your project or training interest.',
  },
];

export default function AcademyBody() {
  return (
    <>
      <AcademyHero />
      <LearningPaths />
      <AcademyAudience />
      <AcademyEnrol />
      <AcademyApproach />
      <FaqSection
        eyebrow="Ray Academy FAQs"
        title={<>Questions, Answered. <span>Before You Enrol.</span></>}
        lead="What to know before starting with Ray Academy."
        items={faqs}
        cta={{ label: 'Enquire About Training', href: 'contact.html#form', variant: 'pur' }}
      />
      <CTASection
        eyebrow="Ready to learn?"
        title={<>Start your <em>learning journey.</em></>}
        copy="Contact us to confirm course availability, format, duration, fees, and upcoming dates."
        primaryLabel="Enquire About Training"
        primaryHref="contact.html#form"
        secondaryLabel="hello@wemray.com"
        secondaryHref="mailto:hello@wemray.com"
        cardOneTitle="Enquire about training"
        cardOneCopy="Tell us which course interests you, and we will help you find the right starting point."
        cardTwoTitle="Explore our services"
        cardTwoCopy="Branding, software, AI, and automation from one connected team."
        cardTwoHref="services.html"
      />
    </>
  );
}

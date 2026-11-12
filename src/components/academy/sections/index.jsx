import AcademyHero from '../../academy/AcademyHero';
import LearningPaths from '../../academy/LearningPaths';
import AcademyAudience from '../../academy/AcademyAudience';
import AcademyApproach from '../../academy/AcademyApproach';
import CTASection from '../../ui/CTASection';
import FaqSection from '../../ui/FaqSection';
import { academyFaqs } from '../../../data/faqs';

export default function AcademySections({ courses = [] }) {
  return (
    <>
      <AcademyHero courses={courses} />
      <LearningPaths courses={courses} />
      <AcademyAudience />
      <AcademyApproach />
      <FaqSection
        eyebrow="Ray Academy FAQs"
        title={<>Questions, Answered. <span>Before You Enrol.</span></>}
        lead="What to know before starting with Ray Academy."
        items={academyFaqs}
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

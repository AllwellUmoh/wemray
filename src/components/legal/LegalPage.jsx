import Button from '../ui/Button';

const EMAIL = 'hello@wemray.com';

export const LEGAL_PAGES = {
  privacy: {
    eyebrow: 'Legal / Privacy',
    title: 'Privacy Policy',
    description: 'How Wemray Technology handles information shared through this website.',
    metaTitle: 'Privacy Policy | Wemray Technology',
    metaDescription: 'How Wemray Technology handles information shared through this website.',
    sections: [
      { title: 'Who we are', body: ['Wemray Technology provides branding, software, digital product, automation, and training services. This website is operated by Wemray Technology from Nigeria and serves clients internationally.', `Questions about this policy can be sent to ${EMAIL}.`] },
      { title: 'Information you provide', body: ['When you contact us through the website form, we collect your name, email address, company name if provided, budget if provided, service interest, project details, and the type of enquiry you selected.', 'We use this information to respond to your enquiry and keep a record of the request. If you email us directly, we receive the information included in that correspondence.'] },
      { title: 'How we use information', list: ['To respond to enquiries and discuss potential work.', 'To scope, deliver, and support services or training.', 'To keep appropriate business records and improve our website and services.', 'To meet legal, accounting, or regulatory obligations.'], after: 'We do not sell personal information.' },
      { title: 'Cookies and analytics', body: ['This build of the website does not include advertising cookies or third-party analytics scripts. Our hosting provider may process standard technical logs, such as IP address, browser type, and request time, to operate and secure the site.'] },
      { title: 'The RAY SEO Analyser', body: ['When you use the RAY SEO Analyser we collect the page URL you submit, the email address (and optional phone number) you provide, the resulting audit report, and technical details such as IP address and browser user agent for rate limiting and security.', 'We use this information to run the audit, store the report so you can view and download it, and email it to you. Contact details are encrypted at rest, retained for up to 90 days, and used for marketing only if you opt in. You can request deletion of your contact details from your report page at any time. We do not sell this data. See the crawler page for details on what the tool fetches.'] },
      { title: 'When information is shared', body: ['We may share information with service providers that help us operate the website or deliver agreed services, but only where needed for that purpose. We may also disclose information where required by law or to protect legal rights.'] },
      { title: 'Retention and security', body: ['We keep personal information only for as long as needed for the purpose it was provided, or as required by law. We use reasonable technical and organisational safeguards, but no method or transmission over the internet is completely secure.'] },
      { title: 'Your choices', body: [`You can ask us to access, correct, or delete personal information we hold about you, or object to certain uses. Email ${EMAIL} and we may ask for information to verify your identity before acting on the request.`] },
      { title: 'Changes to this policy', body: ['We may update this policy as our services or legal obligations change. The latest version will be published on this page with a revised date.'] },
    ],
  },
  terms: {
    eyebrow: 'Legal / Terms',
    title: 'Terms of Service',
    description: 'The terms that apply when you use the Wemray Technology website.',
    metaTitle: 'Terms of Service | Wemray Technology',
    metaDescription: 'The terms that apply when you use the Wemray Technology website.',
    sections: [
      { title: 'About these terms', body: ['These terms apply to your use of the Wemray Technology website. By using the site, you agree to them. If you do not agree, please do not use the site.'] },
      { title: 'Website content', body: ['The content on this website is provided for general information. It may change without notice and does not by itself create a binding offer, guarantee, or client relationship.'] },
      { title: 'Services and engagements', body: ['Descriptions of services, capabilities, and training are indicative. Any project, timeline, fee, deliverable, and level of support will be set out in a separate proposal or written agreement accepted by both parties.'] },
      { title: 'RAY SEO Analyser', body: ['The RAY SEO Analyser is provided free, as a diagnostic tool, for a single page per request. The RAY Score is an independent Wemray metric and is not an official Google score. It does not guarantee rankings, imply a Google penalty, or constitute professional SEO advice for your specific circumstances.', 'By submitting a URL you confirm you have the right to request an audit of that page. Do not use the tool to request audits of pages you are not permitted to analyse, or in a way that overloads our systems. We may rate-limit or block requests.'] },
      { title: 'Intellectual property', body: ['The Wemray Technology name, logo, website design, text, graphics, and other site content are owned by or licensed to Wemray Technology. You may view and use the site for ordinary browsing, but you may not copy, republish, sell, or redistribute its content without written permission, except where the law allows.'] },
      { title: 'Acceptable use', list: ['Do not use the site for unlawful, fraudulent, or harmful activity.', 'Do not attempt to disrupt, overload, probe, or gain unauthorised access to the site or its systems.', 'Do not scrape or harvest content or personal information in a way that breaches applicable law or these terms.'] },
      { title: 'Third-party links', body: ['The site may link to third-party websites or services. We do not control them and are not responsible for their content, availability, or privacy practices.'] },
      { title: 'Disclaimers', body: ['The site is provided on an “as is” and “as available” basis. We do not guarantee that it will always be uninterrupted, error-free, or free of harmful components. Nothing in these terms excludes liability that cannot lawfully be excluded.'] },
      { title: 'Limitation of liability', body: ['To the extent permitted by law, Wemray Technology is not liable for indirect, incidental, special, or consequential loss arising from use of the site. This does not limit liability for fraud, death or personal injury caused by negligence, or any other liability that law does not allow to be limited.'] },
      { title: 'Governing law', body: ['These terms are intended to be governed by the laws of the Federal Republic of Nigeria. Any dispute will be subject to the courts that have jurisdiction under applicable law.'] },
    ],
  },
};

function LegalSection({ section, index }) {
  return (
    <section className="legal-sec">
      <span className="legal-num">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <h2>{section.title}</h2>
        {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.list && (
          <ul>
            {section.list.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
        {section.after && <p>{section.after}</p>}
      </div>
    </section>
  );
}

export default function LegalPage({ kind }) {
  const page = LEGAL_PAGES[kind] || LEGAL_PAGES.privacy;

  return (
    <>
      <section className="hero ah legal-hero" id="top">
        <div className="hero-bg" aria-hidden="true">
          <div className="bl l2 on" />
          <div className="ov" />
          <div className="gr" />
          <div className="pxf" id="pxHero" />
          <div className="orb o1" />
          <div className="orb o2" />
        </div>
        <div className="hero-txt">
          <div className="eb"><span className="pd" />{page.eyebrow}</div>
          <h1 aria-label={page.title}>{page.title}</h1>
          <p className="sub">{page.description}</p>
          <div className="ctas">
            <Button to="/contact" variant="lav">Contact Us</Button>
            <Button to="/" variant="ghost">Back to Home</Button>
          </div>
        </div>
      </section>

      <section className="legal-body">
        <div className="legal-wrap">
          <aside className="legal-note">
            <strong>Draft for review.</strong> This page is a starting point and should be reviewed by a qualified legal professional before launch.
            <span>Last updated: 26 October 2026</span>
          </aside>

          {page.sections.map((section, index) => (
            <LegalSection key={section.title} section={section} index={index} />
          ))}

          <div className="legal-contact">
            <div>
              <span>Questions?</span>
              <h2>Talk to Wemray Technology.</h2>
            </div>
            <Button variant="lav" href={`mailto:${EMAIL}`}>{EMAIL}</Button>
          </div>
        </div>
      </section>
    </>
  );
}

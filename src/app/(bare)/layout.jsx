/**
 * Minimal layout for standalone, full-bleed pages (e.g. the RAY SEO report).
 *
 * Deliberately renders no site header, mobile menu, footer or assistant, so the
 * report reads as a focused, self-contained document with its own branding and
 * a single way back to the main site.
 */
export default function BareLayout({ children }) {
  return <div className="bare-shell">{children}</div>;
}

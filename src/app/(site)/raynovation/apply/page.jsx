import Link from 'next/link';
import RaynovationApplicationForm from '../../../../components/raynovation/RaynovationApplicationForm';
import { RAYNOVATION_TRACKS } from '../../../../data/raynovation-tracks';

export const metadata = {
  title: 'Apply for Raynovation 1.0 | Wemray Technology',
  description: 'Submit your application for Raynovation 1.0, the special training program by Wemray Technology and Nexab Solutions Ltd.',
  robots: { index: false, follow: true },
};

export default function RaynovationApplicationPage() {
  return (
    <main className="raynovation-page rn-application-page">
      <div className="rn-application-shell">
        <Link className="rn-application-back" href="/raynovation">Back to Raynovation</Link>
        <header className="rn-application-heading">
          <p className="rn-kicker">Raynovation 1.0 · February 1, 2027</p>
          <h1>Application form</h1>
          <p>Complete each step to apply for the Raynovation training program.</p>
        </header>
        <RaynovationApplicationForm tracks={RAYNOVATION_TRACKS} />
      </div>
    </main>
  );
}

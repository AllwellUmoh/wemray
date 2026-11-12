import SiteShell from '../../components/site/SiteShell';
import { listCoursesForAssistant, listTracks } from '../../lib/academy/courses';

export const revalidate = 300;

export default async function SiteLayout({ children }) {
  // The assistant needs a compact copy of the catalogue. If the academy
  // tables are not present yet, the shell still renders with an empty set.
  let academyCourses = [];
  let academyTracks = [];

  try {
    [academyCourses, academyTracks] = await Promise.all([
      listCoursesForAssistant(),
      listTracks(),
    ]);
  } catch (error) {
    console.error('Site layout could not load the academy catalogue', error);
  }

  return (
    <SiteShell academyCourses={academyCourses} academyTracks={academyTracks}>
      {children}
    </SiteShell>
  );
}

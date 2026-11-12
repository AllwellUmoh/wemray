import { cookies } from 'next/headers';
import SuccessClient from '../../../../../components/academy/SuccessClient';
import { buildMetadata } from '../../../../../lib/seo';
import { STATUS_COOKIE, readStatusCookieValue } from '../../../../../lib/academy/status-cookie';

export const metadata = buildMetadata({
  title: 'Enrolment status | Ray Academy',
  description: 'Check the status of your Ray Academy enrolment payment.',
  path: '/academy/enrol/success',
  noIndex: true,
});

export default async function EnrolSuccessPage({ searchParams }) {
  const params = await searchParams;
  const reference = typeof params?.reference === 'string' ? params.reference : '';
  const status = typeof params?.status === 'string' ? params.status : '';

  const cookieStore = await cookies();
  const saved = readStatusCookieValue(cookieStore.get(STATUS_COOKIE)?.value);
  const initialEmail = saved && saved.reference === reference ? saved.email : '';

  return <SuccessClient reference={reference} initialStatus={status} initialEmail={initialEmail} />;
}

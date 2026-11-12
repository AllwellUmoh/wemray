import BalanceClient from '../../../../../components/academy/BalanceClient';
import { buildMetadata } from '../../../../../lib/seo';

export const metadata = buildMetadata({
  title: 'Pay enrolment balance | Ray Academy',
  description: 'Pay the outstanding balance on your Ray Academy enrolment.',
  path: '/academy/enrol/balance',
  noIndex: true,
});

export default async function EnrolBalancePage({ searchParams }) {
  const params = await searchParams;
  const reference = typeof params?.reference === 'string' ? params.reference : '';

  return <BalanceClient reference={reference} />;
}

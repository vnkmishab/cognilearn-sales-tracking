import { fetchSitePunches } from '@/lib/api';
import SiteVisitsPageClient from './SiteVisitsPageClient';

export const dynamic = 'force-dynamic';

export default async function SiteVisitsPage() {
  let sitePunches: any[] = [];
  try {
    sitePunches = await fetchSitePunches();
  } catch (e) {
    console.warn('Backend offline or error loading punches, using empty list');
  }

  return <SiteVisitsPageClient initialPunches={sitePunches} />;
}

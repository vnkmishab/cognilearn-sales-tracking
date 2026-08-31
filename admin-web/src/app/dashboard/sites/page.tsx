import { fetchAllSites } from '@/lib/api';
import SitesPageClient from './SitesPageClient';

export const dynamic = 'force-dynamic';

export default async function SitesPage() {
  let sites: any[] = [];
  try {
    sites = await fetchAllSites();
  } catch (e) {
    console.warn('Backend not running yet, using empty sites list');
  }

  return <SitesPageClient initialSites={sites} />;
}

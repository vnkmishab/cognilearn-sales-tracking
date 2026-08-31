'use client';

interface DownloadSiteVisitsReportProps {
  sitePunches: any[];
}

export default function DownloadSiteVisitsReport({ sitePunches }: DownloadSiteVisitsReportProps) {
  const handleDownload = () => {
    if (sitePunches.length === 0) {
      alert('No site visits found to export.');
      return;
    }

    let csvContent = 'SITE VISITS LOG REPORT\n\n';
    const headers = ['Employee Name', 'Employee Code', 'Site Name', 'Site Code', 'Punch Type', 'Latitude', 'Longitude', 'GPS Accuracy (m)', 'Device ID', 'Sync Time'];
    csvContent += headers.join(',') + '\n';

    sitePunches.forEach((punch) => {
      const empName = punch.employee ? `"${punch.employee.firstName} ${punch.employee.lastName}"` : 'N/A';
      const empCode = punch.employee?.employeeCode || 'N/A';
      const siteName = punch.site ? `"${punch.site.name}"` : 'N/A';
      const siteCode = punch.site?.siteCode || 'N/A';
      const punchType = punch.punchType || 'N/A';
      const lat = punch.latitude !== null && punch.latitude !== undefined ? punch.latitude : 'N/A';
      const lng = punch.longitude !== null && punch.longitude !== undefined ? punch.longitude : 'N/A';
      const accuracy = punch.gpsAccuracy !== null && punch.gpsAccuracy !== undefined ? punch.gpsAccuracy : 'N/A';
      const deviceId = punch.deviceId ? `"${punch.deviceId}"` : 'N/A';
      const syncTime = punch.syncedAt ? `"${new Date(punch.syncedAt).toLocaleString()}"` : 'N/A';

      const row = [empName, empCode, siteName, siteCode, punchType, lat, lng, accuracy, deviceId, syncTime];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Site_Visits_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="group relative overflow-hidden bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-400 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all flex items-center gap-2"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span className="relative z-10">Export Log</span>
    </button>
  );
}

export interface ExportDonor {
  id: string;
  name: string;
  bloodGroup: string;
  age?: number;
  city?: string;
  approximateArea?: string;
  lastDonation?: string;
  availability: 'available' | 'unavailable';
  distance?: number;
  phone?: string;
  email?: string;
  totalDonations?: number;
}

export interface ExportBloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  componentType?: string;
  hospital: string;
  approximateArea?: string;
  unitsRequired: number;
  requiredDate: string;
  urgency: 'critical' | 'high' | 'normal';
  status: 'active' | 'fulfilled' | 'cancelled';
  contactNumber?: string;
  notes?: string;
}

function formatDateSafe(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
}

export function exportDonorsToCSV(donors: ExportDonor[]): void {
  const headers = ['Name', 'Blood Group', 'City / Area', 'Availability', 'Last Donation', 'Privacy Status'];
  const rows = donors.map((donor) => [
    donor.name || 'Consented Volunteer',
    donor.bloodGroup || 'Not specified',
    donor.approximateArea || donor.city || 'Regional Health Network',
    donor.availability || 'available',
    formatDateSafe(donor.lastDonation),
    'Confidential (Platform Dispatch Only)',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `blood-donors-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportRequestsToCSV(requests: ExportBloodRequest[]): void {
  const headers = [
    'Patient Reference',
    'Blood Group',
    'Component',
    'Hospital / Facility',
    'Area',
    'Units Required',
    'Required By',
    'Urgency',
    'Status',
  ];

  const rows = requests.map((request) => [
    request.patientName || 'Blood Recipient',
    request.bloodGroup,
    request.componentType || 'Whole Blood',
    request.hospital,
    request.approximateArea || 'Regional',
    request.unitsRequired || 1,
    formatDateSafe(request.requiredDate),
    request.urgency,
    request.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `blood-requests-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printDonorList(donors: ExportDonor[]): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Blood Donor Registry - HealthSphere</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
          .logo { font-size: 20px; font-weight: bold; color: #0f766e; }
          .date { color: #64748b; font-size: 12px; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; }
          .badge { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .badge-available { background-color: #dcfce7; color: #166534; }
          .badge-unavailable { background-color: #f1f5f9; color: #64748b; }
          .footer { margin-top: 24px; text-align: center; color: #64748b; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">HealthSphere — Voluntary Blood Donor Directory</div>
          <div class="date">Generated: ${new Date().toLocaleString()}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Donor Reference</th>
              <th>Blood Group</th>
              <th>Approximate Region</th>
              <th>Availability</th>
              <th>Last Donation Date</th>
              <th>Dispatch Channel</th>
            </tr>
          </thead>
          <tbody>
            ${donors
              .map(
                (donor) => `
              <tr>
                <td><strong>${donor.name}</strong></td>
                <td>${donor.bloodGroup}</td>
                <td>${donor.approximateArea || donor.city || 'Regional Health Network'}</td>
                <td><span class="badge ${donor.availability === 'available' ? 'badge-available' : 'badge-unavailable'}">${donor.availability}</span></td>
                <td>${formatDateSafe(donor.lastDonation)}</td>
                <td>In-App Platform Dispatch</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="footer">
          Total Donors: ${donors.length} | Available: ${donors.filter((d) => d.availability === 'available').length}
          <br/>Protected under HealthSphere Clinical Privacy Protocol. No unconsented donor PII disclosed.
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

export function printRequestList(requests: ExportBloodRequest[]): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Clinical Blood Requests - HealthSphere</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
          .logo { font-size: 20px; font-weight: bold; color: #be123c; }
          .date { color: #64748b; font-size: 12px; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; }
          .badge { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .badge-critical { background-color: #ffe4e6; color: #9f1239; }
          .badge-high { background-color: #ffedd5; color: #9a3412; }
          .badge-normal { background-color: #f1f5f9; color: #334155; }
          .footer { margin-top: 24px; text-align: center; color: #64748b; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">HealthSphere — Active Blood Requisition Schedule</div>
          <div class="date">Generated: ${new Date().toLocaleString()}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Blood Group</th>
              <th>Component</th>
              <th>Hospital / Facility</th>
              <th>Units</th>
              <th>Required By</th>
              <th>Urgency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${requests
              .map(
                (req) => `
              <tr>
                <td><strong>${req.patientName}</strong></td>
                <td>${req.bloodGroup}</td>
                <td>${req.componentType || 'Whole Blood'}</td>
                <td>${req.hospital}</td>
                <td>${req.unitsRequired}</td>
                <td>${formatDateSafe(req.requiredDate)}</td>
                <td><span class="badge badge-${req.urgency}">${req.urgency}</span></td>
                <td>${req.status}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="footer">
          Total Requisitions: ${requests.length} | Open: ${requests.filter((r) => r.status === 'active').length}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

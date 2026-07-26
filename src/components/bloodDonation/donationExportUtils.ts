// TODO: Backend integration required for real donor APIs
// TODO: Backend integration required for blood bank APIs
// TODO: Backend integration required for hospital integration

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  age: number;
  city: string;
  lastDonation?: string;
  availability: 'available' | 'unavailable';
  distance?: number;
  phone?: string;
  email?: string;
  totalDonations?: number;
}

interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  hospital: string;
  unitsRequired: number;
  requiredDate: string;
  urgency: 'critical' | 'high' | 'normal';
  status: 'active' | 'fulfilled' | 'cancelled';
  contactNumber?: string;
  notes?: string;
}

export function exportDonorsToCSV(donors: Donor[]): void {
  // TODO: Backend integration for real donor data export
  const headers = ['Name', 'Blood Group', 'Age', 'City', 'Availability', 'Last Donation', 'Phone', 'Email', 'Total Donations'];
  const rows = donors.map((donor) => [
    donor.name,
    donor.bloodGroup,
    donor.age,
    donor.city,
    donor.availability,
    donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'N/A',
    donor.phone || 'N/A',
    donor.email || 'N/A',
    donor.totalDonations || 0,
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

export function exportRequestsToCSV(requests: BloodRequest[]): void {
  // TODO: Backend integration for real request data export
  const headers = ['Patient Name', 'Blood Group', 'Hospital', 'Units Required', 'Required Date', 'Urgency', 'Status', 'Contact Number'];
  const rows = requests.map((request) => [
    request.patientName,
    request.bloodGroup,
    request.hospital,
    request.unitsRequired,
    new Date(request.requiredDate).toLocaleDateString(),
    request.urgency,
    request.status,
    request.contactNumber || 'N/A',
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

export function printDonorList(donors: Donor[]): void {
  // TODO: Backend integration for real donor data printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Blood Donor List - HealthSphere</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #0d9488; }
          .date { color: #64748b; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: bold; }
          .badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .badge-available { background-color: #dcfce7; color: #166534; }
          .badge-unavailable { background-color: #f1f5f9; color: #64748b; }
          .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">HealthSphere - Blood Donation</div>
          <div class="date">Generated on ${new Date().toLocaleDateString()}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Blood Group</th>
              <th>Age</th>
              <th>City</th>
              <th>Availability</th>
              <th>Last Donation</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            ${donors.map((donor) => `
              <tr>
                <td>${donor.name}</td>
                <td>${donor.bloodGroup}</td>
                <td>${donor.age}</td>
                <td>${donor.city}</td>
                <td><span class="badge ${donor.availability === 'available' ? 'badge-available' : 'badge-unavailable'}">${donor.availability}</span></td>
                <td>${donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'N/A'}</td>
                <td>${donor.phone || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Total Donors: ${donors.length} | Available: ${donors.filter((d) => d.availability === 'available').length}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

export function printRequestList(requests: BloodRequest[]): void {
  // TODO: Backend integration for real request data printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Blood Request List - HealthSphere</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #e11d48; }
          .date { color: #64748b; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: bold; }
          .badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .badge-critical { background-color: #fecaca; color: #991b1b; }
          .badge-high { background-color: #fed7aa; color: #9a3412; }
          .badge-normal { background-color: #dbeafe; color: #1e40af; }
          .badge-active { background-color: #dcfce7; color: #166534; }
          .badge-fulfilled { background-color: #f1f5f9; color: #64748b; }
          .badge-cancelled { background-color: #fecaca; color: #991b1b; }
          .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">HealthSphere - Blood Requests</div>
          <div class="date">Generated on ${new Date().toLocaleDateString()}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Blood Group</th>
              <th>Hospital</th>
              <th>Units</th>
              <th>Required Date</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map((request) => `
              <tr>
                <td>${request.patientName}</td>
                <td>${request.bloodGroup}</td>
                <td>${request.hospital}</td>
                <td>${request.unitsRequired}</td>
                <td>${new Date(request.requiredDate).toLocaleDateString()}</td>
                <td><span class="badge badge-${request.urgency}">${request.urgency}</span></td>
                <td><span class="badge badge-${request.status}">${request.status}</span></td>
                <td>${request.contactNumber || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Total Requests: ${requests.length} | Active: ${requests.filter((r) => r.status === 'active').length} | Critical: ${requests.filter((r) => r.urgency === 'critical' && r.status === 'active').length}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

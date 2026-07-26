import type { Medicine } from './medicineTypes';

export const exportMedicinesToCSV = (medicines: Medicine[]): void => {
  const headers = [
    'Medicine Name',
    'Dosage',
    'Strength',
    'Frequency',
    'Timing',
    'Start Date',
    'End Date',
    'Remaining Pills',
    'Total Pills',
    'Doctor Name',
    'Status',
    'Adherence %',
  ];

  const rows = medicines.map((medicine) => [
    `"${medicine.name}"`,
    `"${medicine.dosage}"`,
    `"${medicine.strength || ''}"`,
    `"${medicine.frequency}"`,
    `"${medicine.timing || ''}"`,
    `"${medicine.startDate || ''}"`,
    `"${medicine.endDate || ''}"`,
    medicine.remainingPills ?? '',
    medicine.totalPills ?? '',
    `"${medicine.doctorName || ''}"`,
    `"${medicine.status}"`,
    medicine.adherence ?? '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `medicines-export-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printMedicineList = (medicines: Medicine[]): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const today = new Date().toLocaleDateString();

  const tableRows = medicines
    .map(
      (medicine) => `
    <tr>
      <td>${medicine.name}</td>
      <td>${medicine.dosage}</td>
      <td>${medicine.frequency}</td>
      <td>${medicine.startDate || '—'}</td>
      <td>${medicine.endDate || '—'}</td>
      <td>${medicine.remainingPills ?? '—'}</td>
      <td>${medicine.status}</td>
    </tr>
  `,
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medicine List - HealthSphere</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #1e293b;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0d9488;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #0d9488;
            margin-bottom: 10px;
          }
          .date {
            color: #64748b;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #0d9488;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">HealthSphere</div>
          <div class="date">Generated on ${today}</div>
        </div>
        <h2>Medicine List</h2>
        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          HealthSphere - Your Personal Healthcare Management System
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};

// TODO: Backend integration required for emergency data export
// TODO: Backend integration required for medical card download
// TODO: Backend integration required for emergency history export

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: 'primary' | 'secondary';
}

interface MedicalCard {
  name?: string;
  bloodGroup?: string;
  age?: number;
  allergies?: string[];
  chronicDiseases?: string[];
  surgeries?: string[];
  emergencyContact?: string;
  healthId?: string;
}

export function exportEmergencyContactsToJSON(contacts: EmergencyContact[]): void {
  const data = JSON.stringify(contacts, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `emergency-contacts-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportEmergencyContactsToCSV(contacts: EmergencyContact[]): void {
  const headers = ['Name', 'Relationship', 'Phone', 'Email', 'Priority'];
  const rows = contacts.map((contact) => [
    contact.name,
    contact.relationship,
    contact.phone,
    contact.email || 'N/A',
    contact.priority,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `emergency-contacts-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadMedicalCard(card: MedicalCard): void {
  // TODO: Backend integration for medical card download
  const data = JSON.stringify(card, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `medical-card-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printMedicalCard(card: MedicalCard): void {
  // TODO: Backend integration for medical card printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medical ID Card - HealthSphere</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #e11d48; }
          .card { border: 2px solid #e2e8f0; border-radius: 16px; padding: 20px; max-width: 400px; margin: 0 auto; }
          .field { margin-bottom: 15px; }
          .label { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; }
          .value { font-size: 16px; font-weight: bold; color: #0f172a; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 14px; font-weight: bold; }
          .badge-blood { background-color: #fecaca; color: #991b1b; }
          .badge-id { background-color: #f1f5f9; color: #64748b; }
          .allergies { display: flex; flex-wrap: wrap; gap: 8px; }
          .allergy { background-color: #fecaca; color: #991b1b; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">HealthSphere - Medical ID</div>
        </div>
        <div class="card">
          <div class="field">
            <div class="label">Name</div>
            <div class="value">${card.name || 'Not Set'}</div>
          </div>
          <div class="field">
            <div class="label">Blood Group</div>
            <div class="badge badge-blood">${card.bloodGroup || 'Not Set'}</div>
          </div>
          <div class="field">
            <div class="label">Age</div>
            <div class="value">${card.age || 'Not Set'}</div>
          </div>
          ${card.healthId ? `
          <div class="field">
            <div class="label">Health ID</div>
            <div class="badge badge-id">${card.healthId}</div>
          </div>
          ` : ''}
          ${card.allergies && card.allergies.length > 0 ? `
          <div class="field">
            <div class="label">Allergies</div>
            <div class="allergies">
              ${card.allergies.map(a => `<span class="allergy">${a}</span>`).join('')}
            </div>
          </div>
          ` : ''}
          ${card.chronicDiseases && card.chronicDiseases.length > 0 ? `
          <div class="field">
            <div class="label">Medical Conditions</div>
            <div class="allergies">
              ${card.chronicDiseases.map(d => `<span class="allergy" style="background-color: #fed7aa; color: #9a3412;">${d}</span>`).join('')}
            </div>
          </div>
          ` : ''}
          ${card.emergencyContact ? `
          <div class="field">
            <div class="label">Emergency Contact</div>
            <div class="value">${card.emergencyContact}</div>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          Generated on ${new Date().toLocaleDateString()}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

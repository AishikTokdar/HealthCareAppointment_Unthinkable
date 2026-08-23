import html2pdf from 'html2pdf.js';

export function generatePrescriptionPdf(appointment, mode = 'PATIENT') {
  const doctorName = appointment.doctor?.user?.name || 'Doctor';
  const patientName = appointment.patient?.name || 'Patient';
  const specialisation = appointment.doctor?.specialisation || 'General Medicine';
  const dateStr = new Date(appointment.startsAt).toISOString().split('T')[0];
  const formattedDate = new Date(appointment.startsAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  let filename = `Prescription_${doctorName.replace(/\s+/g, '_')}_${dateStr}.pdf`;
  if (mode === 'DOCTOR') {
    filename = `ClinicalSummary_${patientName.replace(/\s+/g, '_')}_${dateStr}.pdf`;
  } else if (mode === 'ADMIN') {
    filename = `MedicalRecord_${patientName.replace(/\s+/g, '_')}_vs_${doctorName.replace(/\s+/g, '_')}_${dateStr}.pdf`;
  }

  const symptoms = appointment.symptomForm?.rawSymptoms || 'N/A';
  const chiefComplaint = appointment.symptomForm?.chiefComplaint || symptoms;
  const urgency = appointment.symptomForm?.urgency || 'Medium';
  const clinicalNotes = appointment.visitNote?.clinicalNotes || 'No notes recorded';
  const patientSummary = appointment.visitNote?.patientSummary || clinicalNotes;
  const prescription = Array.isArray(appointment.visitNote?.prescription)
    ? appointment.visitNote.prescription
    : [];

  const medsHtml = prescription.length === 0
    ? `<p style="font-size: 13px; color: #94a3b8; font-style: italic;">No specific medications prescribed during this visit.</p>`
    : `
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="background: #4338ca; color: #ffffff;">
            <th style="padding: 10px; border-radius: 4px 0 0 0;">Medication Name</th>
            <th style="padding: 10px;">Dosage</th>
            <th style="padding: 10px;">Frequency</th>
            <th style="padding: 10px; border-radius: 0 4px 0 0;">Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${prescription.map((med, i) => `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 10px; font-weight: 600; color: #0f172a;">${med.drug}</td>
              <td style="padding: 10px; color: #334155;">${med.dose}</td>
              <td style="padding: 10px; color: #334155;">${med.frequency}</td>
              <td style="padding: 10px; color: #64748b; font-size: 12px;">${med.instructions || 'As advised'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  const htmlContent = `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; max-width: 800px; margin: 0 auto; line-height: 1.5;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 24px;">
        <div>
          <h1 style="font-size: 22px; color: #4338ca; margin: 0 0 4px 0; font-weight: 700; letter-spacing: -0.5px;">
            Healthcare Appointment & Follow-up Manager
          </h1>
          <p style="font-size: 13px; color: #64748b; margin: 0;">Official Clinical Summary & Medical Prescription</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6366f1; letter-spacing: 0.5px; display: block;">Ref ID</span>
          <span style="font-size: 12px; color: #334155; font-family: monospace;">${appointment.id.slice(0, 13)}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <div>
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">Attending Physician</span>
          <h3 style="font-size: 16px; color: #0f172a; margin: 0 0 2px 0;">${doctorName}</h3>
          <p style="font-size: 13px; color: #4f46e5; margin: 0 0 4px 0; font-weight: 500;">${specialisation}</p>
          <p style="font-size: 12px; color: #64748b; margin: 0;">Email: ${appointment.doctor?.user?.email || 'N/A'}</p>
        </div>
        <div style="border-left: 1px solid #cbd5e1; padding-left: 20px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">Patient Details</span>
          <h3 style="font-size: 16px; color: #0f172a; margin: 0 0 2px 0;">${patientName}</h3>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 2px 0;">Email: ${appointment.patient?.email || 'N/A'}</p>
          <p style="font-size: 12px; color: #64748b; margin: 0;">Phone: ${appointment.patient?.phone || 'N/A'}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; background: #f1f5f9; padding: 10px 16px; border-radius: 6px; font-size: 12px; margin-bottom: 24px;">
        <div><strong>Consultation Date & Time:</strong> ${formattedDate}</div>
        <div><strong>Triage Urgency:</strong> <span style="color: ${urgency === 'High' ? '#dc2626' : urgency === 'Low' ? '#059669' : '#d97706'}; font-weight: 700;">${urgency}</span></div>
      </div>

      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 13px; text-transform: uppercase; color: #475569; margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          Reported Symptoms & Chief Complaint
        </h4>
        <div style="font-size: 13px; color: #334155; background: #fff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
          <strong>Chief Complaint:</strong> ${chiefComplaint}<br/>
          <span style="color: #64748b; font-size: 12px;">Symptoms Detail: ${symptoms}</span>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 13px; text-transform: uppercase; color: #475569; margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          Clinical Notes & Doctor Assessment
        </h4>
        <p style="font-size: 13px; color: #1e293b; margin: 0 0 8px 0; line-height: 1.6;">${clinicalNotes}</p>
        ${patientSummary ? `<div style="background: #eef2ff; border-left: 3px solid #6366f1; padding: 10px 14px; font-size: 12px; color: #3730a3; border-radius: 0 6px 6px 0;"><strong>Patient Summary:</strong> ${patientSummary}</div>` : ''}
      </div>

      <div style="margin-bottom: 32px;">
        <h4 style="font-size: 13px; text-transform: uppercase; color: #475569; margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          Rx - Prescribed Medications
        </h4>
        ${medsHtml}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 14px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 8px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://healthcareappointment.pages.dev/verify/' + appointment.id)}" alt="QR Verification" style="width: 64px; height: 64px; border-radius: 4px; border: 1px solid #cbd5e1;" />
          <div>
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #4338ca; letter-spacing: 0.5px; display: block;">Digital Verification Seal</span>
            <span style="font-size: 11px; color: #334155; font-weight: 600; display: block; margin-top: 2px;">Scan to Verify Rx Authenticity</span>
            <span style="font-size: 10px; color: #64748b; font-family: monospace;">UUID: ${appointment.id.slice(0, 18)}...</span>
          </div>
        </div>
        <div style="text-align: center;">
          <div style="border-bottom: 1px solid #0f172a; width: 180px; margin-bottom: 6px; padding-bottom: 4px;">
            <span style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 20px; color: #4338ca;">${doctorName}</span>
          </div>
          <span style="font-size: 12px; font-weight: 600; color: #334155;">${doctorName}</span>
          <span style="font-size: 11px; color: #64748b; display: block;">Authorized Medical Practitioner</span>
        </div>
      </div>

    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  const opt = {
    margin:       [0.4, 0.4, 0.4, 0.4],
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(container).save().then(() => {
    document.body.removeChild(container);
  }).catch(() => {
    document.body.removeChild(container);
  });
}

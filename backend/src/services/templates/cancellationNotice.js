function cancellationNoticeTemplate(payload) {
  const { patientName, doctorName, startsAt, reason } = payload;
  const formattedStart = new Date(startsAt).toLocaleString();

  return {
    subject: `Appointment Cancelled - Dr. ${doctorName}`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px;">
        <h2 style="color: #f43f5e; margin-top: 0;">Appointment Cancelled</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment scheduled for <strong>${formattedStart}</strong> with Dr. ${doctorName} has been cancelled.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p style="color: #8b9db5; font-size: 14px;">You may log in to book a new appointment at your convenience.</p>
      </div>
    `
  };
}

module.exports = cancellationNoticeTemplate;

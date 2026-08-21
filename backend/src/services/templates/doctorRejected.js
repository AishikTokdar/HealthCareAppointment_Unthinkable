function doctorRejectedTemplate(payload) {
  const { doctorName, reason } = payload;

  return {
    subject: 'Doctor Account Application Status Update',
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f43f5e; margin-top: 0;">Application Status Update</h2>
        <p>Dear ${doctorName},</p>
        <p>Your doctor profile registration application could not be approved at this time.</p>
        ${reason ? `<div style="background: #0f1623; padding: 16px; border-radius: 8px; border-left: 4px solid #f43f5e; margin: 20px 0;"><strong style="color: #f43f5e;">Reason:</strong> ${reason}</div>` : ''}
      </div>
    `
  };
}

module.exports = doctorRejectedTemplate;

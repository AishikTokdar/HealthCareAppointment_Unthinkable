function doctorRejectedTemplate(payload) {
  const { doctorName, reason } = payload;

  return {
    subject: `Doctor Profile Application Status`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px;">
        <h2 style="color: #f43f5e; margin-top: 0;">Application Status Update</h2>
        <p>Dear Dr. ${doctorName},</p>
        <p>Your doctor registration request has been reviewed.</p>
        ${reason ? `<p><strong>Feedback:</strong> ${reason}</p>` : ''}
        <p style="color: #8b9db5; font-size: 14px;">Please contact clinic administration for further assistance.</p>
      </div>
    `
  };
}

module.exports = doctorRejectedTemplate;

function medicationReminderTemplate(payload) {
  const { patientName, drug, dose, frequency } = payload;

  return {
    subject: `Medication Reminder: ${drug}`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px;">
        <h2 style="color: #10b981; margin-top: 0;">Medication Reminder</h2>
        <p>Namaste ${patientName},</p>
        <p>It is time for your prescribed medication dose:</p>
        <div style="background: #0f1623; border: 1px solid rgba(255,255,255,0.06); padding: 20px; border-radius: 12px; margin: 24px 0;">
          <p style="margin: 4px 0;"><strong>Medication:</strong> ${drug}</p>
          <p style="margin: 4px 0;"><strong>Dose:</strong> ${dose}</p>
          <p style="margin: 4px 0;"><strong>Frequency:</strong> ${frequency}</p>
        </div>
        <p style="color: #8b9db5; font-size: 14px;">Please take your medication as prescribed by your doctor.</p>
      </div>
    `
  };
}

module.exports = medicationReminderTemplate;

function bookingConfirmationTemplate(payload) {
  const { patientName, doctorName, specialisation, startsAt, endsAt } = payload;
  const formattedStart = new Date(startsAt).toLocaleString();

  return {
    subject: `Appointment Confirmed - Dr. ${doctorName}`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px;">
        <h2 style="color: #7c5cfc; margin-top: 0;">Appointment Confirmation</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment has been successfully scheduled.</p>
        <div style="background: #0f1623; border: 1px solid rgba(255,255,255,0.06); padding: 20px; border-radius: 12px; margin: 24px 0;">
          <p style="margin: 4px 0;"><strong>Doctor:</strong> Dr. ${doctorName} (${specialisation})</p>
          <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${formattedStart}</p>
        </div>
        <p style="color: #8b9db5; font-size: 14px;">Thank you for choosing our Healthcare Platform.</p>
      </div>
    `
  };
}

module.exports = bookingConfirmationTemplate;

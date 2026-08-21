const prisma = require('../../config/db');
const { generatePreVisitSummary } = require('../../services/llm');

async function submitSymptomForm(appointmentId, rawSymptoms) {
  const symptomForm = await prisma.symptomForm.upsert({
    where: { appointmentId },
    create: {
      appointmentId,
      rawSymptoms,
      llmStatus: 'PENDING'
    },
    update: {
      rawSymptoms,
      llmStatus: 'PENDING'
    }
  });

  setImmediate(async () => {
    try {
      const llmRes = await generatePreVisitSummary(rawSymptoms);
      await prisma.symptomForm.update({
        where: { id: symptomForm.id },
        data: {
          urgency: llmRes.data?.urgency || 'Medium',
          chiefComplaint: llmRes.data?.chiefComplaint || '',
          suggestedQs: llmRes.data?.suggestedQuestions || [],
          llmRawOutput: llmRes.raw,
          llmStatus: llmRes.status
        }
      });
    } catch (err) {
      console.error('Async symptom LLM processing error:', err.message);
    }
  });

  return symptomForm;
}

async function getSymptomSummary(user, appointmentId) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true }
  });

  if (!appt) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.role === 'PATIENT' && appt.patientId !== user.userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  if (user.role === 'DOCTOR' && appt.doctor.userId !== user.userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  const form = await prisma.symptomForm.findUnique({
    where: { appointmentId }
  });

  if (!form) {
    const err = new Error('Symptom form not found for this appointment');
    err.statusCode = 404;
    throw err;
  }

  return form;
}

module.exports = {
  submitSymptomForm,
  getSymptomSummary
};

import client from './client';

export const symptomsApi = {
  submit: (appointmentId, rawSymptoms) => client.post('/symptoms', { appointmentId, rawSymptoms }),
  getSummary: (appointmentId) => client.get(`/symptoms/${appointmentId}`)
};

import client from './client';

export const visitsApi = {
  submit: (appointmentId, clinicalNotes, prescription) => client.post('/visits', { appointmentId, clinicalNotes, prescription }),
  getSummary: (appointmentId) => client.get(`/visits/${appointmentId}`)
};

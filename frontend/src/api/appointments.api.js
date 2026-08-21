import client from './client';

export const appointmentsApi = {
  holdSlot: (doctorId, startsAt) => client.post('/appointments/hold', { doctorId, startsAt }),
  confirmBooking: (holdToken, symptoms) => client.post('/appointments', { holdToken, symptoms }),
  getPatientAppointments: () => client.get('/appointments'),
  getDetail: (id) => client.get(`/appointments/${id}`),
  reschedule: (id, startsAt) => client.put(`/appointments/${id}/reschedule`, { startsAt }),
  cancel: (id, reason) => client.delete(`/appointments/${id}`, { data: { reason } }),
  complete: (id) => client.patch(`/appointments/${id}/complete`),
  startChat: (id) => client.post(`/appointments/${id}/start-chat`),
  closeChat: (id) => client.post(`/appointments/${id}/close-chat`),
  heartbeat: (id) => client.post(`/appointments/${id}/heartbeat`),
  sendMessage: (id, message) => client.post(`/appointments/${id}/messages`, { message }),
  getMessages: (id) => client.get(`/appointments/${id}/messages`),
  aiRefineDraft: (id, draft) => client.post(`/appointments/${id}/ai-refine`, { draft })
};

import client from './client';

export const appointmentsApi = {
  holdSlot: (doctorId, startsAt) => client.post('/appointments/hold', { doctorId, startsAt }),
  confirmBooking: (holdToken, symptoms) => client.post('/appointments', { holdToken, symptoms }),
  getPatientAppointments: () => client.get('/appointments'),
  getDetail: (id) => client.get(`/appointments/${id}`),
  reschedule: (id, startsAt) => client.put(`/appointments/${id}/reschedule`, { startsAt }),
  cancel: (id, reason) => client.delete(`/appointments/${id}`, { data: { reason } }),
  complete: (id) => client.patch(`/appointments/${id}/complete`)
};

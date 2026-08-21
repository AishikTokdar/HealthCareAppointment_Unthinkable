import client from './client';

export const doctorsApi = {
  search: (specialisation) => client.get('/doctors', { params: { specialisation } }),
  getPublicProfile: (id) => client.get(`/doctors/${id}`),
  getSlots: (id, date) => client.get(`/doctors/${id}/slots`, { params: { date } }),
  getDoctorAppointments: () => client.get('/doctors/me/appointments')
};

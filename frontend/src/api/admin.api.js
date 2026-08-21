import client from './client';

export const adminApi = {
  getPendingDoctors: () => client.get('/admin/doctors/pending'),
  approveDoctor: (id) => client.post(`/admin/doctors/${id}/approve`),
  rejectDoctor: (id, reason) => client.post(`/admin/doctors/${id}/reject`, { reason }),
  getAllDoctors: () => client.get('/admin/doctors'),
  createDoctor: (data) => client.post('/admin/doctors', data),
  updateDoctor: (id, data) => client.put(`/admin/doctors/${id}`, data),
  addLeave: (id, date, reason) => client.post(`/admin/doctors/${id}/leave`, { date, reason }),
  removeLeave: (id, leaveId) => client.delete(`/admin/doctors/${id}/leave/${leaveId}`),
  getStats: () => client.get('/admin/stats'),
  getNotifications: () => client.get('/admin/notifications')
};

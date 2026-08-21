import client from './client';

export const authApi = {
  registerPatient: (data) => client.post('/auth/register', data),
  registerDoctor: (data) => client.post('/auth/register/doctor', data),
  login: (credentials) => client.post('/auth/login', credentials),
  getMe: () => client.get('/auth/me')
};

import client from './client';

export const calendarApi = {
  getAuthUrl: () => client.get('/calendar/auth-url'),
  disconnect: () => client.delete('/calendar/disconnect')
};

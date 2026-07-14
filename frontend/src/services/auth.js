import { api } from './api';

export const authService = {
  login: async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role
      }));
    }
    return data;
  },

  register: async (username, email, password, role = 'USER') => {
    return await api.post('/auth/register', { username, email, password, role });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'ROLE_ADMIN';
  }
};

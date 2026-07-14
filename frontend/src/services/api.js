const API_URL = 'http://localhost:8080/api';

export const api = {
  get: async (endpoint) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      let message = 'API request failed';
      try {
        const errorData = JSON.parse(errorText);
        message = errorData.message || errorData.error || message;
      } catch (e) {}
      throw new Error(message);
    }
    return response.json();
  },

  post: async (endpoint, data, isMultipart = false) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isMultipart ? data : JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      let message = 'API request failed';
      try {
        const errorData = JSON.parse(errorText);
        message = errorData.message || errorData.error || message;
      } catch (e) {}
      throw new Error(message);
    }
    return response.json();
  },

  put: async (endpoint, data) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      let message = 'API request failed';
      try {
        const errorData = JSON.parse(errorText);
        message = errorData.message || errorData.error || message;
      } catch (e) {}
      throw new Error(message);
    }
    return response.json();
  },

  delete: async (endpoint) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      let message = 'API request failed';
      try {
        const errorData = JSON.parse(errorText);
        message = errorData.message || errorData.error || message;
      } catch (e) {}
      throw new Error(message);
    }
    return response.json();
  }
};

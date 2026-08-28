const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, ...data };
  }

  return data;
}

export const api = {
  register: (data) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (phone) => request('/login', { method: 'POST', body: JSON.stringify({ phone }) }),
  loginVerify: (phone, pin) => request('/login/verify', { method: 'POST', body: JSON.stringify({ phone, pin }) }),
};

export function setToken(token) {
  localStorage.setItem('auth_token', token);
}

export function getToken() {
  return localStorage.getItem('auth_token');
}

export function clearToken() {
  localStorage.removeItem('auth_token');
}

import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://mini-crm-3ijo.onrender.com',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('crm_token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
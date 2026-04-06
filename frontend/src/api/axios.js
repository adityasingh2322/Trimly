import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://trimly-y2a1.onrender.com/api',
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo);
      if (parsedInfo.token) {
        config.headers.Authorization = `Bearer ${parsedInfo.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

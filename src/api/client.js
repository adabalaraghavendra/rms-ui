import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => {
    // Every API reply is { status, message, data, pagination }.
    // Unwrap it so callers keep using `res.data`, and read `res.pagination` for lists.
    const body = res.data;
    if (body && typeof body === 'object' && 'status' in body && 'data' in body) {
      res.pagination = body.pagination;
      res.message = body.message;
      res.data = body.data;
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';
export const money = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const thisMonth = () => new Date().toISOString().slice(0, 7);

/** Ask for everyone in one go (for dropdowns / rent split) instead of paging. */
export const ALL = { page: 1, page_size: 100 };

export default api;

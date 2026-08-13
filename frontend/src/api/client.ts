import axios from 'axios';

const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.endsWith('.local');

const API_URL = import.meta.env.VITE_API_URL || (isLocal
  ? `${window.location.protocol}//${window.location.hostname}:8080`
  : window.location.origin);

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let devLoginPromise: Promise<string | null> | null = null;

const getLocalDevRole = () => window.location.pathname.startsWith('/admin') ? 'admin' : 'user';

const exchangeLegacyDevToken = async (): Promise<string | null> => {
  if (!isLocal) {
    return null;
  }

  if (!devLoginPromise) {
    devLoginPromise = axios.post(`${API_URL}/auth/dev-login`, {
      role: getLocalDevRole(),
    }).then(({ data }) => {
      const accessToken = data.data.access_token as string;
      const refreshToken = data.data.refresh_token as string;
      localStorage.removeItem('dev_mock_user');
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      return accessToken;
    }).catch((error) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('dev_mock_user');
      throw error;
    }).finally(() => {
      devLoginPromise = null;
    });
  }

  return devLoginPromise;
};

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('access_token');

    if (token === 'dev-mock-token') {
      token = await exchangeLegacyDevToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest.url || '';
    const isAuthRoute =
      url.includes('/auth/dev-login') ||
      url.includes('/auth/login') ||
      url.includes('/auth/social') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh');

    if (error.response?.status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        localStorage.setItem('access_token', data.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.data.access_token}`;
        return apiClient(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject admin session token into Authorization header
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('amongu_admin_token') || localStorage.getItem('amongu_admin_token');
    
    // Purge outdated hardcoded tokens immediately
    if (token === 'amongu_admin_secret_token_2026' || token?.startsWith('amongu_admin_')) {
      sessionStorage.removeItem('amongu_admin_token');
      sessionStorage.removeItem('amongu_admin_auth');
      localStorage.removeItem('amongu_admin_token');
      localStorage.removeItem('amongu_admin_auth');
      return config;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercept 401/403 responses to force logout invalidated sessions
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error?.response?.status;
      const isLoginRequest = error?.config?.url?.includes('/admin/login');

      if ((status === 401 || status === 403) && !isLoginRequest) {
        console.warn('🔒 Admin session expired or invalidated. Enforcing logout.');
        sessionStorage.removeItem('amongu_admin_token');
        sessionStorage.removeItem('amongu_admin_auth');
        localStorage.removeItem('amongu_admin_token');
        localStorage.removeItem('amongu_admin_auth');

        // Notify active React components
        window.dispatchEvent(new Event('amongu_admin_force_logout'));
      }
    }
    return Promise.reject(error);
  }
);

import axios from 'axios';
import { clientEnv } from '../config/env';
import { auth } from '../config/firebase';

export const apiClient = axios.create({
  baseURL: clientEnv.API_URL,
  timeout: 4000, // 4-second timeout to prevent UI freezes when backend is slow or offline
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject fresh Firebase ID Token into Authorization header if authenticated
apiClient.interceptors.request.use(async (config) => {
  if (auth && auth.currentUser) {
    try {
      // Add a 1.5s race timeout so unconfigured/dummy Firebase keys never stall requests
      const tokenPromise = auth.currentUser.getIdToken();
      const timeoutPromise = new Promise<string | null>((resolve) =>
        setTimeout(() => resolve(null), 1500)
      );
      const token = await Promise.race([tokenPromise, timeoutPromise]);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Fallback gracefully in dev/dummy environment
    }
  }
  return config;
});

export default apiClient;

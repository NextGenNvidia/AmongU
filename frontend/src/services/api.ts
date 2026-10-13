import axios from 'axios';
import { clientEnv } from '../config/env';
import { auth } from '../config/firebase';

export const apiClient = axios.create({
  baseURL: clientEnv.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject fresh Firebase ID Token into Authorization header if authenticated
apiClient.interceptors.request.use(async (config) => {
  if (auth && auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

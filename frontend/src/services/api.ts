import axios from 'axios';
import { clientEnv } from '../config/env';
import { auth } from '../config/firebase';

export const apiClient = axios.create({
  baseURL: clientEnv.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject fresh Firebase ID Token into Authorization header
apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

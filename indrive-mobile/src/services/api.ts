import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from './config';

// Claves para SecureStore
export const SECURE_KEYS = {
  accessToken: 'indrive_access_token',
  refreshToken: 'indrive_refresh_token',
};

export const saveToken = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

export const getToken = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key);
};

export const deleteToken = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};

// Cola de peticiones fallidas durante el refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

// Cliente Axios principal
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de SOLICITUD: inyecta el JWT automáticamente
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken(SECURE_KEYS.accessToken);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPUESTA: maneja el refresh automático ante 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya está refrescando, encolar la petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getToken(SECURE_KEYS.refreshToken);
        if (!refreshToken) throw new Error('No refresh token disponible');

        // Llamar al endpoint de refresh del backend (ms-base auth module)
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken: string = data.accessToken;
        await saveToken(SECURE_KEYS.accessToken, newAccessToken);
        if (data.refreshToken) {
          await saveToken(SECURE_KEYS.refreshToken, data.refreshToken);
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Limpiar credenciales y forzar logout
        await deleteToken(SECURE_KEYS.accessToken);
        await deleteToken(SECURE_KEYS.refreshToken);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

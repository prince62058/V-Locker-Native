import axios from 'axios';
import { Platform } from 'react-native';
import { getSecureItem } from '../storage/keychain';

const api = axios.create({
  // Production URL - deployed backend
  // baseURL: 'https://v-locker.framekarts.com/api/',

  // Local Development URLs (uncomment for local testing)
  // Local Development URLs (uncomment for local testing)
  baseURL:
    Platform.OS === 'android'
      ? 'https://vlockerbackend.onrender.com/api/'
      : 'http://localhost:3000/api/',
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    const token = await getSecureItem('USER_TOKEN');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.metadata = { startTime: new Date() };
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => {
    const endTime = new Date();
    response.duration = endTime - response.config.metadata.startTime;
    console.log('API INTERCEPTORS RESPONSE ---> ', response);
    return response;
  },
  error => {
    const endTime = new Date();
    const startTime = error.config?.metadata?.startTime;
    const duration = startTime ? endTime - startTime : null;

    if (error.response) {
      error.response.duration = duration;
    }

    console.log(
      'API INTERCEPTORS ERROR ---> ',
      error.response || error.message,
    );

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.request?._response ||
      error?.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(errorMessage);
  },
);

export const getApi = async (endpoint, params) => {
  try {
    return await api.get(endpoint, params);
  } catch (error) {
    throw error;
  }
};

export const postApi = async (endpoint, data) => {
  try {
    return await api.post(endpoint, data);
  } catch (error) {
    throw error;
  }
};

export const putApi = async (endpoint, data) => {
  try {
    return await api.put(endpoint, data);
  } catch (error) {
    throw error;
  }
};

export const deleteApi = async (endpoint, params) => {
  try {
    return await api.delete(endpoint, params);
  } catch (error) {
    throw error;
  }
};

export const postMediaApi = async (endpoint, data) => {
  try {
    let formData = new FormData();
    for (let key in data) formData.append(key, data[key]);
    return await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (error) {
    throw error;
  }
};

export const putMediaApi = async (endpoint, data) => {
  try {
    let formData = new FormData();
    for (let key in data) formData.append(key, data[key]);
    return await api.put(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (error) {
    throw error;
  }
};
export { api };
export default api;

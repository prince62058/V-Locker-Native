import axios from 'axios';
import { Platform } from 'react-native';
import { getSecureItem } from '../storage/keychain';

export const BASE_API_URL =
  Platform.OS === 'android'
    ? 'https://vlockerbackend.onrender.com/api/'
    : 'https://vlockerbackend.onrender.com/api/';

const api = axios.create({
  // Production URL - deployed backend
  // baseURL: 'https://v-locker.framekarts.com/api/',

  // Local Development URLs (uncomment for local testing)
  baseURL: BASE_API_URL,
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const MEDIA_BASE_URL =
  Platform.OS === 'android'
    ? 'https://vlockerbackend.onrender.com'
    : 'https://vlockerbackend.onrender.com';

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
    const token = await getSecureItem('USER_TOKEN');
    let formData = new FormData();
    for (let key in data) {
      if (data[key] && typeof data[key] === 'object' && data[key].uri) {
        console.log(`Appending file to FormData (POST): key=${key}`);
        formData.append(key, {
          uri: data[key].uri,
          type: data[key].type || 'image/jpeg',
          name: data[key].name || `upload_${Date.now()}.jpg`,
        });
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    }

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    const responseData = await response.json();
    console.log('PostMediaApi status:', response.status);

    if (!response.ok) {
      const errorMessage =
        responseData?.message || responseData?.error || 'Upload failed';
      throw new Error(errorMessage);
    }

    return { data: responseData };
  } catch (error) {
    console.log('Post Media API Error:', error);
    throw error;
  }
};

export const putMediaApi = async (endpoint, data) => {
  try {
    const token = await getSecureItem('USER_TOKEN');
    let formData = new FormData();
    for (let key in data) {
      if (data[key] && typeof data[key] === 'object' && data[key].uri) {
        console.log(
          `Appending file to FormData (PUT): key=${key} uri=${data[key].uri}`,
        );
        formData.append(key, {
          uri: data[key].uri,
          type: data[key].type || 'image/jpeg',
          name: data[key].name || `upload_${Date.now()}.jpg`,
        });
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    }

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`Sending PUT Media to ${BASE_API_URL}${endpoint}`);

    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers,
      body: formData,
    });

    const text = await response.text();
    console.log('PutMediaApi raw status:', response.status);
    console.log('PutMediaApi raw response:', text);

    let responseData;
    try {
      responseData = JSON.parse(text);
    } catch {
      responseData = { message: text };
    }

    if (!response.ok) {
      const errorMessage =
        responseData?.message || responseData?.error || 'Upload failed';
      throw new Error(errorMessage);
    }

    return { data: responseData };
  } catch (error) {
    console.log('Put Media API Error:', error);
    throw error;
  }
};

export { api };
export default api;

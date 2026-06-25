import axios from 'axios';
import {API_BASE_URL, API_TOKEN} from '../utils/constants';
import {logDebug, logError} from '../utils/logger';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
  },
});


apiClient.interceptors.request.use(
  config => {
    logDebug('API', 'request', {
      method: config.method,
      url: `${config.baseURL || ''}${config.url || ''}`,
      params: config.params,
      hasAuthHeader: Boolean(config.headers?.Authorization),
    });
    return config;
  },
  error => {
    logError('API', 'request setup failed', error);
    return Promise.reject(error);
  },
);


apiClient.interceptors.response.use(
  response => {
    logDebug('API', 'response', {
      status: response.status,
      url: response.config?.url,
      dataKeys:
        response.data && typeof response.data === 'object'
          ? Object.keys(response.data)
          : typeof response.data,
    });
    return response;
  },
  error => {
    const normalized = {
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.',
      status: error?.response?.status || null,
      isNetworkError: !error?.response,
      original: error,
    };
    logError('API', 'response failed', {
      status: normalized.status,
      message: normalized.message,
      isNetworkError: normalized.isNetworkError,
      url: error?.config?.url,
      responseData: error?.response?.data,
    });
    return Promise.reject(normalized);
  },
);

export default apiClient;

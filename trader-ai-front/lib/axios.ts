import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens, logging, etc.
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available (for future use)
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = (error.response.data as any)?.message || error.message;
      
      switch (status) {
        case 401:
          console.error('Unauthorized - Please login');
          // Redirect to login or refresh token
          break;
        case 403:
          console.error('Forbidden - Insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error(`API Error: ${message}`);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - No response from server');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Export types for use in other files
export type { AxiosRequestConfig, AxiosResponse, AxiosError };

import axios from 'axios';
import tokenService from './token-service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from secure storage
        const refreshToken = localStorage.getItem('refresh_token'); // In production, use HttpOnly cookies

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh the token
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        });

        // Get the new access token
        const { access } = response.data;

        // Parse JWT to get expiration time
        const tokenData = JSON.parse(atob(access.split('.')[1]));
        const expiresIn = tokenData.exp - Math.floor(Date.now() / 1000);

        // Store the new token securely in memory
        tokenService.setAccessToken(access, expiresIn);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        tokenService.clearTokens();
        localStorage.removeItem('user_info');

        // Redirect to login page if in admin area
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add request interceptor to always include latest token from memory
apiClient.interceptors.request.use((config) => {
  // Get token from memory
  const token = tokenService.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;

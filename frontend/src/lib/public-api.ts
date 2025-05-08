import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Remove credentials and auth headers for public endpoints
publicApiClient.interceptors.request.use((config) => {
  // Ensure no auth headers are sent for public endpoints
  if (config.headers) {
    delete config.headers.Authorization;
  }
  return config;
});

export default publicApiClient;


import tokenService from './token-service';

export const getAuthHeaders = (isMultipart = false) => {
  const token = tokenService.getAccessToken();
  if (!token) {
    // Instead of throwing error, redirect to login if in admin section
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/login';
      return {};
    }
    throw new Error('Authentication required');
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };

  if (isMultipart) {
    // For multipart/form-data, let the browser set the Content-Type
    // with the correct boundary
    delete headers['Content-Type'];
  } else {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

export const isAuthenticated = (): boolean => {
  return tokenService.isAuthenticated();
};

export const checkAuthAndRedirect = (): void => {
  if (!isAuthenticated() && window.location.pathname.startsWith('/admin')) {
    window.location.href = '/admin/login';
  }
};

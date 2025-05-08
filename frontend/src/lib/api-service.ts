
import { getAuthHeaders } from './auth-utils';
import apiClient from './api-adapter';
import publicApiClient from './public-api';

// Helper function to fix image URLs
export const fixImageUrl = (imageUrl: string | null | undefined): string | null => {
  console.log(`fixImageUrl called with:`, imageUrl);

  if (!imageUrl) {
    console.log(`fixImageUrl: imageUrl is null or undefined, returning null`);
    return null;
  }

  // If it's a placeholder URL, replace it with our local default image
  if (imageUrl.includes('via.placeholder.com')) {
    console.log(`fixImageUrl: Replacing placeholder URL with default image`);
    return '/images/default-market.jpg';
  }

  // If it's already an absolute URL, return it as is
  if (imageUrl.startsWith('http')) {
    console.log(`fixImageUrl: URL is already absolute, returning as is: ${imageUrl}`);
    return imageUrl;
  }

  // Fix incorrect API URLs - the backend might be returning /api/ instead of /media/
  if (imageUrl.startsWith('/api/')) {
    console.log(`fixImageUrl: Fixing incorrect API URL: ${imageUrl}`);
    imageUrl = imageUrl.replace('/api/', '/media/');
    console.log(`fixImageUrl: Fixed to: ${imageUrl}`);
  }

  // Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  console.log(`fixImageUrl: Using API URL: ${apiUrl}`);

  // Add the base URL to the image path
  let fixedUrl = '';

  // Make sure we don't double up on slashes
  if (imageUrl.startsWith('/')) {
    fixedUrl = `${apiUrl}${imageUrl}`;
  } else {
    fixedUrl = `${apiUrl}/${imageUrl}`;
  }

  console.log(`fixImageUrl: Final fixed URL: ${fixedUrl}`);

  // Add a cache-busting parameter to force a fresh load
  const cacheBuster = `?t=${Date.now()}`;
  fixedUrl = `${fixedUrl}${fixedUrl.includes('?') ? '&' : ''}${cacheBuster}`;
  console.log(`fixImageUrl: URL with cache buster: ${fixedUrl}`);

  return fixedUrl;
};
import {
  AboutHero,
  MissionVision,
  TeamMember,
  Partner,
  CompanyOverview,
  ContactMessage,
  ContactInfo,
  ContactDescription,
  Product,
  Solution,
  NewsArticle,
  NavigationItem,
  HeroSection,
  Feature,
  TargetMarket,
  WhyChooseUs,
  PartnerDescription,
  TeamDescription,
  User,
  SiteSettings,
  ProductDescription,
  SolutionDescription,
  NewsDescription
} from './types';
import { AxiosError } from 'axios';

const createService = <T>(endpoint: string, hasFileUploads = false) => ({
  getAll: async (): Promise<T[]> => {
    try {
      // Use apiClient for authenticated endpoints, publicApiClient for public ones
      const isAuthenticatedEndpoint = [
        'users', 'product-descriptions', 'solution-descriptions', 'news-descriptions',
        'contact-descriptions', 'partner-descriptions', 'team-descriptions', 'site-settings'
      ].includes(endpoint);

      const client = isAuthenticatedEndpoint ? apiClient : publicApiClient;
      const response = await client.get(`/${endpoint}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  },

  getById: async (id: string | number): Promise<T> => {
    try {
      // Use apiClient for authenticated endpoints, publicApiClient for public ones
      const isAuthenticatedEndpoint = [
        'users', 'product-descriptions', 'solution-descriptions', 'news-descriptions',
        'contact-descriptions', 'partner-descriptions', 'team-descriptions', 'site-settings'
      ].includes(endpoint);

      const client = isAuthenticatedEndpoint ? apiClient : publicApiClient;

      // Safely handle the URL construction
      const idString = String(id);
      // Remove any trailing slashes from the ID
      const cleanId = idString.endsWith('/') ? idString.slice(0, -1) : idString;
      const url = `/${endpoint}/${cleanId}/`;

      const response = await client.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint} ${id}:`, error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<T>): Promise<T> => {
    try {
      const isFormData = data instanceof FormData;
      console.log(`Creating ${endpoint} with:`, {
        isFormData,
        hasFileUploads,
        hasImage: isFormData && (data.has('image') || data.has('logo'))
      });

      // Log FormData contents for debugging
      if (isFormData) {
        console.log(`=== CREATE ${endpoint.toUpperCase()} FORMDATA ===`);
        console.log('FormData entries:');
        for (const pair of (data as FormData).entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }
      }

      let response;

      if (isFormData) {
        // For FormData, we need to explicitly remove Content-Type header
        console.log(`Sending FormData to /${endpoint}/ with POST method`);

        // Double-check the FormData contents before sending
        console.log('Final FormData check before sending:');
        for (const pair of (data as FormData).entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }

        response = await apiClient.post(
          `/${endpoint}/`,
          data,
          {
            headers: {
              ...getAuthHeaders(true),
            },
            // This is critical - it tells axios not to set Content-Type
            // The browser will automatically set the correct multipart/form-data with boundary
            transformRequest: [(data, headers) => {
              if (headers) delete headers['Content-Type'];
              return data;
            }],
            validateStatus: null
          }
        );
      } else {
        // For JSON data, use the standard Content-Type
        response = await apiClient.post(
          `/${endpoint}/`,
          data,
          {
            headers: {
              ...getAuthHeaders(false),
              'Content-Type': 'application/json'
            },
            validateStatus: null
          }
        );
      }

      if (response.status >= 400) {
        console.error(`Error creating ${endpoint}:`, {
          status: response.status,
          data: response.data
        });
        throw new Error(JSON.stringify(response.data));
      }

      console.log(`Success creating ${endpoint}:`, {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error creating ${endpoint}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  update: async (id: string | number, data: FormData | Partial<T>): Promise<T> => {
    try {
      const isFormData = data instanceof FormData;
      console.log(`Updating ${endpoint} with:`, {
        id,
        isFormData,
        hasFileUploads,
        hasImage: isFormData && (data.has('image') || data.has('logo'))
      });

      // Log FormData contents for debugging
      if (isFormData) {
        console.log(`=== UPDATE ${endpoint.toUpperCase()} FORMDATA ===`);
        console.log('FormData entries:');
        for (const pair of (data as FormData).entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }
      }

      const idString = String(id);
      // Remove any trailing slashes from the ID
      const cleanId = idString.endsWith('/') ? idString.slice(0, -1) : idString;
      const url = `/${endpoint}/${cleanId}/`;

      let response;

      if (isFormData) {
        // For FormData, we need to explicitly remove Content-Type header
        console.log(`Sending FormData to ${url} with PATCH method`);

        // Double-check the FormData contents before sending
        console.log('Final FormData check before sending:');
        for (const pair of (data as FormData).entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }

        response = await apiClient.patch(
          url,
          data,
          {
            headers: {
              ...getAuthHeaders(true),
            },
            // This is critical - it tells axios not to set Content-Type
            // The browser will automatically set the correct multipart/form-data with boundary
            transformRequest: [(data, headers) => {
              if (headers) delete headers['Content-Type'];
              return data;
            }],
            validateStatus: null
          }
        );
      } else {
        // For JSON data, use the standard Content-Type
        response = await apiClient.patch(
          url,
          data,
          {
            headers: {
              ...getAuthHeaders(false),
              'Content-Type': 'application/json'
            },
            validateStatus: null
          }
        );
      }

      if (response.status >= 400) {
        console.error(`Error updating ${endpoint}:`, {
          status: response.status,
          data: response.data
        });
        throw new Error(JSON.stringify(response.data));
      }

      console.log(`Success updating ${endpoint}:`, {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      // If it's an axios error with a response
      if (error.response?.data) {
        throw new Error(JSON.stringify(error.response.data));
      }
      // If it's our own error from above
      if (error.message) {
        throw error;
      }
      // Fallback error
      throw new Error("An unexpected error occurred");
    }
  },

  delete: async (id: string | number): Promise<void> => {
    try {
      const headers = getAuthHeaders();
      // Safely handle the URL construction
      const idString = String(id);
      // Remove any trailing slashes from the ID
      const cleanId = idString.endsWith('/') ? idString.slice(0, -1) : idString;
      const url = `/${endpoint}/${cleanId}/`;

      await apiClient.delete(url, { headers });
    } catch (error) {
      if ((error as AxiosError).response?.status === 401) {
        window.location.href = '/admin/login';
      }
      console.error(`Error deleting ${endpoint} ${id}:`, error);
      throw error;
    }
  },
});

// Services declarations moved to the end of the file
export const newsService = {
  getAll: async () => {
    try {
      const response = await publicApiClient.get('/news/');
      return response.data;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      console.log(`Fetching news article with ID: ${id}`);
      // Fix the URL format - don't add trailing slash to the ID itself
      // The correct format is /news/{id}/
      const response = await publicApiClient.get(`/news/${id}/`);
      console.log('News article response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching news article ${id}:`, error);
      throw error;
    }
  },

  create: async (data: any) => {
    try {
      // Check if data is FormData
      const isFormData = data instanceof FormData;

      console.log('Creating news article with:', {
        isFormData,
        dataType: typeof data,
        hasImage: isFormData && data.has('image')
      });

      // For FormData, we need to explicitly remove Content-Type header
      // to let the browser set it with the correct boundary
      if (isFormData) {
        // Make the request without Content-Type header for FormData
        const response = await apiClient.post('/news/', data, {
          headers: {
            ...getAuthHeaders(true),
          },
          // This is critical - it tells axios not to set Content-Type
          // The browser will automatically set the correct multipart/form-data with boundary
          transformRequest: [(data, headers) => {
            if (headers) delete headers['Content-Type'];
            return data;
          }]
        });
        return response.data;
      } else {
        // For JSON data, use the standard Content-Type
        const response = await apiClient.post('/news/', data, {
          headers: {
            ...getAuthHeaders(false),
            'Content-Type': 'application/json'
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error creating news article:', error);
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    try {
      // Check if data is FormData
      const isFormData = data instanceof FormData;

      console.log('Updating news article with:', {
        id,
        isFormData,
        dataType: typeof data,
        hasImage: isFormData && data.has('image')
      });

      // For FormData, we need to explicitly remove Content-Type header
      // to let the browser set it with the correct boundary
      if (isFormData) {
        // Make the request without Content-Type header for FormData
        const response = await apiClient.put(`/news/${id}/`, data, {
          headers: {
            ...getAuthHeaders(true),
          },
          // This is critical - it tells axios not to set Content-Type
          // The browser will automatically set the correct multipart/form-data with boundary
          transformRequest: [(data, headers) => {
            if (headers) delete headers['Content-Type'];
            return data;
          }]
        });
        return response.data;
      } else {
        // For JSON data, use the standard Content-Type
        const response = await apiClient.put(`/news/${id}/`, data, {
          headers: {
            ...getAuthHeaders(false),
            'Content-Type': 'application/json'
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error(`Error updating news article ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      await apiClient.delete(`/news/${id}/`);
    } catch (error) {
      console.error(`Error deleting news article ${id}:`, error);
      throw error;
    }
  }
};
// Service declarations moved to the end of the file

export const userService = {
  ...createService<User>('users', true),

  // Override getAll method to add better error handling and logging
  getAll: async () => {
    try {
      console.log('Fetching all users');
      // Use apiClient for admin pages
      const response = await apiClient.get('/users/', {
        headers: getAuthHeaders()
      });
      console.log('Users response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  },

  // Get authors for public pages
  getAuthors: async () => {
    try {
      console.log('Fetching all authors');
      // Use publicApiClient for public-facing pages
      const response = await publicApiClient.get('/authors/');
      console.log('Authors response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching authors:', error);
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  },

  // Add this new method
  checkUsername: async (username: string, userId?: string): Promise<boolean> => {
    try {
      const params = new URLSearchParams({ username });
      if (userId) params.append('userId', userId);

      const response = await apiClient.get(`/users/check_username/?${params}`);
      return response.data.available;
    } catch (error) {
      console.error('Error checking username:', error);
      throw error;
    }
  },

  // Additional user-specific methods
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/users/profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.patch('/users/profile/', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post('/users/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      }, {
        headers: getAuthHeaders()
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};

// Add this with the other service exports
export const dashboardService = {
  getStats: async () => {
    try {
      // Get user info for role check
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');

      // Base endpoints that all roles can access
      const endpoints = {
        products: '/products/',
        solutions: '/solutions/',
        news: '/news/',
        contact: '/contact/',
      };

      // Create an array of promises for parallel fetching
      const promises = Object.entries(endpoints).map(([key, endpoint]) =>
        publicApiClient.get(endpoint)
          .then(response => ({ [key]: response.data.length }))
          .catch(error => {
            console.error(`Error fetching ${key}:`, error);
            return { [key]: 0 };
          })
      );

      // Only add users endpoint if user has admin role
      let usersCount = 0;
      if (userInfo.role === 'admin') {
        try {
          const usersResponse = await apiClient.get('/users/');
          usersCount = usersResponse.data.length;
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }

      // Wait for all promises to resolve
      const results = await Promise.all(promises);

      // Combine all results into a single object
      const stats = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      return {
        products: stats.products || 0,
        solutions: stats.solutions || 0,
        news: stats.news || 0,
        contacts: stats.contact || 0,
        users: usersCount
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if something goes wrong
      return {
        products: 0,
        solutions: 0,
        news: 0,
        contacts: 0,
        users: 0
      };
    }
  },

  getActivity: async () => {
    try {
      const response = await apiClient.get('/activity/');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  }
};

// Contact Info Service override
const baseContactInfoService = createService<ContactInfo>('contact-info', true);
export const contactInfoService = {
  ...baseContactInfoService,
  update: async (id: string | number, data: Partial<ContactInfo>): Promise<ContactInfo> => {
    try {
      const headers = getAuthHeaders();
      const url = `/contact-info/${id}/`;

      const response = await apiClient.patch(
        url,
        data,
        {
          headers,
          validateStatus: (status) => status < 500
        }
      );

      if (response.status >= 400) {
        throw new Error(JSON.stringify(response.data));
      }

      return response.data;
    } catch (error: any) {
      console.error(`Error updating contact-info:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};

// Contact Description Service override
const baseContactDescriptionService = createService<ContactDescription>('contact-descriptions', true);
export const contactDescriptionService = {
  ...baseContactDescriptionService,
  update: async (id: string | number, data: Partial<ContactDescription> | FormData): Promise<ContactDescription> => {
    try {
      const isFormData = data instanceof FormData;
      console.log(`Updating contact description ${id} with:`, {
        isFormData,
        hasFileUploads: true,
        hasImage: isFormData && data.has('background_image_file')
      });

      // Log FormData contents for debugging
      if (isFormData) {
        console.log(`=== UPDATE CONTACT DESCRIPTION FORMDATA ===`);
        console.log('FormData entries:');
        for (const pair of (data as FormData).entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }
      }

      const url = `/contact-descriptions/${id}/`;
      let response;

      if (isFormData) {
        // For FormData, we need to explicitly remove Content-Type header
        console.log(`Sending FormData to ${url} with PATCH method`);

        response = await apiClient.patch(
          url,
          data,
          {
            headers: {
              ...getAuthHeaders(true),
            },
            // This is critical - it tells axios not to set Content-Type
            transformRequest: [(data, headers) => {
              if (headers) delete headers['Content-Type'];
              return data;
            }],
            validateStatus: (status) => status < 500
          }
        );
      } else {
        // For JSON data, use the standard Content-Type
        response = await apiClient.patch(
          url,
          data,
          {
            headers: {
              ...getAuthHeaders(false),
              'Content-Type': 'application/json'
            },
            validateStatus: (status) => status < 500
          }
        );
      }

      if (response.status >= 400) {
        console.error(`Error updating contact description:`, {
          status: response.status,
          data: response.data
        });
        throw new Error(JSON.stringify(response.data));
      }

      console.log(`Success updating contact description:`, {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error updating contact-descriptions:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  create: async (data: Partial<ContactDescription> | FormData): Promise<ContactDescription> => {
    try {
      const isFormData = data instanceof FormData;
      console.log(`Creating contact description with:`, {
        isFormData,
        hasFileUploads: true,
        hasImage: isFormData && data.has('background_image_file')
      });

      // Log FormData contents for debugging
      if (isFormData) {
        console.log(`=== CREATE CONTACT DESCRIPTION FORMDATA ===`);
        console.log('FormData entries:');
        for (const pair of (data as FormData).entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }
      }

      let response;

      if (isFormData) {
        // For FormData, we need to explicitly remove Content-Type header
        console.log(`Sending FormData to /contact-descriptions/ with POST method`);

        response = await apiClient.post(
          `/contact-descriptions/`,
          data,
          {
            headers: {
              ...getAuthHeaders(true),
            },
            // This is critical - it tells axios not to set Content-Type
            transformRequest: [(data, headers) => {
              if (headers) delete headers['Content-Type'];
              return data;
            }],
            validateStatus: (status) => status < 500
          }
        );
      } else {
        // For JSON data, use the standard Content-Type
        response = await apiClient.post(
          `/contact-descriptions/`,
          data,
          {
            headers: {
              ...getAuthHeaders(false),
              'Content-Type': 'application/json'
            },
            validateStatus: (status) => status < 500
          }
        );
      }

      if (response.status >= 400) {
        console.error(`Error creating contact description:`, {
          status: response.status,
          data: response.data
        });
        throw new Error(JSON.stringify(response.data));
      }

      console.log(`Success creating contact description:`, {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error creating contact description:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};


export const authService = {
  login: async (username: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.post('/auth/login/', { username, password });
      localStorage.setItem('authToken', response.data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout/');
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      const response = await apiClient.post('/auth/password-reset/', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.post('/auth/password-reset/confirm/', {
        token,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
};

// Export all services
// Create a custom implementation for productsService
const baseProductsService = createService<Product>('products', true);
export const productsService = {
  ...baseProductsService,

  // Override getAll to fix image URLs
  getAll: async (): Promise<Product[]> => {
    try {
      console.log('Fetching all products');
      const response = await publicApiClient.get('/products/');
      console.log('Raw products response:', response.data);

      // Process the response data to fix image URLs
      const processedData = response.data.map((product: Product) => {
        console.log(`Processing product ${product.id}:`, product);

        return {
          ...product,
          // Fix the image URL
          image: product.image ? fixImageUrl(product.image) : null
        };
      });

      console.log('Processed products data:', processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Override getById to fix image URLs
  getById: async (id: string | number): Promise<Product> => {
    try {
      console.log(`Fetching product with ID: ${id}`);
      const response = await publicApiClient.get(`/products/${id}/`);
      console.log('Product detail response:', response.data);

      // Fix the image URL
      const processedData = {
        ...response.data,
        image: response.data.image ? fixImageUrl(response.data.image) : null
      };

      console.log('Processed product data:', processedData);
      return processedData;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }
};
// Create a custom implementation for productDescriptionService
const baseProductDescriptionService = createService<ProductDescription>('product-descriptions');
export const productDescriptionService = {
  ...baseProductDescriptionService,

  // Override getAll to ensure it always returns an array
  getAll: async () => {
    try {
      console.log('Fetching all product descriptions');
      console.log('Request URL:', '/product-descriptions/');

      // For public pages, don't require authentication
      const headers = {};

      console.log('Request headers:', headers);

      const response = await apiClient.get('/product-descriptions/', {
        headers: headers
      });

      console.log('Product descriptions response status:', response.status);
      console.log('Product descriptions response headers:', response.headers);
      console.log('Product descriptions response data:', response.data);

      // Ensure we always return an array
      if (!Array.isArray(response.data)) {
        console.warn('Product descriptions response is not an array:', response.data);

        // If it's an object with an id, treat it as a single item
        if (response.data && typeof response.data === 'object' && response.data.id) {
          console.log('Converting single object to array:', response.data);

          // Check if hero_image exists
          if (response.data.hero_image) {
            console.log('Hero image found in response:', response.data.hero_image);
            console.log('Hero image type:', typeof response.data.hero_image);

            // Fix the hero_image URL
            const fixedImageUrl = fixImageUrl(response.data.hero_image);
            console.log('Fixed hero image URL:', fixedImageUrl);

            const singleItem = {
              ...response.data,
              hero_image: fixedImageUrl
            };

            console.log('Processed single item:', singleItem);
            return [singleItem];
          } else {
            console.warn('No hero_image found in response data:', response.data);
            const singleItem = {
              ...response.data,
              hero_image: null
            };
            return [singleItem];
          }
        }

        // Otherwise return empty array
        console.warn('Response data is not an array and does not have an id property');
        return [];
      }

      // Process the response data to ensure hero_image is properly handled
      const processedData = response.data.map((item: any) => {
        console.log('Processing product description item:', item);

        // Check if hero_image exists
        if (item.hero_image) {
          console.log('Hero image found in item:', item.hero_image);
          console.log('Hero image type:', typeof item.hero_image);

          // Fix the hero_image URL
          const fixedImageUrl = fixImageUrl(item.hero_image);
          console.log('Fixed hero image URL:', fixedImageUrl);

          return {
            ...item,
            hero_image: fixedImageUrl
          };
        } else {
          console.warn('No hero_image found in item:', item);
          return {
            ...item,
            hero_image: null
          };
        }
      });

      console.log('Processed product descriptions data:', processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching product descriptions:', error);
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  },

  // Override update method to properly handle FormData
  update: async (id: string | number, data: any): Promise<ProductDescription> => {
    try {
      console.log(`Updating product description ${id} with data:`, data);

      // Check if data is FormData
      const isFormData = data instanceof FormData;
      console.log('Is FormData:', isFormData);

      if (isFormData) {
        // Log FormData contents
        console.log('FormData contents:');
        let hasTitle = false;
        let hasDescription = false;

        for (const pair of (data as FormData).entries()) {
          if (pair[0] === 'title') hasTitle = true;
          if (pair[0] === 'description') hasDescription = true;

          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }

        // Ensure title and description are always included
        if (!hasTitle) {
          console.log('Adding empty title field');
          (data as FormData).append('title', '');
        }

        if (!hasDescription) {
          console.log('Adding empty description field');
          (data as FormData).append('description', '');
        }

        // Create a new FormData object with all fields
        const cleanedFormData = new FormData();

        // Add all fields, including empty strings
        for (const pair of (data as FormData).entries()) {
          const key = pair[0];
          const value = pair[1];

          // Add the field to the cleaned FormData
          cleanedFormData.append(key, value);
          console.log(`Added ${key} to cleaned FormData`);
        }

        // Make the request with the cleaned FormData
        try {
          const response = await apiClient.patch(`/product-descriptions/${id}/`, cleanedFormData, {
            headers: {
              ...getAuthHeaders(true),
            },
            // This is critical - it tells axios not to set Content-Type
            transformRequest: [(data, headers) => {
              if (headers) delete headers['Content-Type'];
              return data;
            }],
            // Add timeout to prevent hanging requests
            timeout: 30000,
            // Add validateStatus to handle non-200 responses
            validateStatus: (status) => status < 500
          });

          console.log('Update response:', response.data);

          if (response.status >= 400) {
            console.error(`Error updating product description ${id}:`, response.data);
            throw new Error(JSON.stringify(response.data));
          }

          return response.data;
        } catch (requestError: any) {
          console.error(`Error in PATCH request for product description ${id}:`, requestError);

          // If we got a response with data, use that
          if (requestError.response?.data) {
            console.error('Response data:', requestError.response.data);
          }

          // Try to get the product description to return something
          try {
            const getResponse = await apiClient.get(`/product-descriptions/${id}/`, {
              headers: getAuthHeaders()
            });
            console.log('Retrieved product description after error:', getResponse.data);
            return getResponse.data;
          } catch (getError) {
            console.error('Failed to retrieve product description after error:', getError);
            throw requestError;
          }
        }
      } else {
        // For JSON data
        const response = await apiClient.patch(`/product-descriptions/${id}/`, data, {
          headers: {
            ...getAuthHeaders(false),
            'Content-Type': 'application/json'
          },
          // Add validateStatus to handle non-200 responses
          validateStatus: (status) => status < 500
        });

        console.log('Update response:', response.data);

        if (response.status >= 400) {
          console.error(`Error updating product description ${id}:`, response.data);
          throw new Error(JSON.stringify(response.data));
        }

        return response.data;
      }
    } catch (error) {
      console.error(`Error updating product description ${id}:`, error);

      // Try to get the product description to return something
      try {
        const response = await apiClient.get(`/product-descriptions/${id}/`, {
          headers: getAuthHeaders()
        });
        console.log('Retrieved product description after error:', response.data);
        return response.data;
      } catch (getError) {
        console.error('Failed to retrieve product description after error:', getError);
        throw error;
      }
    }
  }
};
// Create a custom implementation for solutionsService
const baseSolutionsService = createService<Solution>('solutions', true);
export const solutionsService = {
  ...baseSolutionsService,

  // Override getById to add better logging and error handling
  getById: async (id: string | number): Promise<Solution> => {
    try {
      console.log(`Fetching solution with ID: ${id}`);
      const response = await publicApiClient.get(`/solutions/${id}/`);
      console.log('Solution response:', response.data);

      // Process the response data to ensure image is properly handled
      const processedData = {
        ...response.data,
        // Fix the image URL if needed
        image: response.data.image ? fixImageUrl(response.data.image) : null
      };

      console.log('Processed solution data:', processedData);
      return processedData;
    } catch (error) {
      console.error(`Error fetching solution ${id}:`, error);
      throw error;
    }
  }
};
// Create a custom implementation for solutionDescriptionService
const baseSolutionDescriptionService = createService<SolutionDescription>('solution-descriptions', true);
export const solutionDescriptionService = {
  ...baseSolutionDescriptionService,

  // Override getAll to ensure it always returns an array
  getAll: async () => {
    try {
      console.log('Fetching all solution descriptions');

      // Try the custom endpoint first
      try {
        console.log('Making request to /solution-descriptions/ endpoint');
        // Use publicApiClient for public-facing pages
        const response = await publicApiClient.get('/solution-descriptions/', {
          timeout: 10000, // 10 seconds timeout
          // Add validateStatus to handle non-200 responses
          validateStatus: (status) => status < 500
        });

        console.log('Solution descriptions response status:', response.status);
        console.log('Solution descriptions response data:', JSON.stringify(response.data, null, 2));

        // Handle error responses
        if (response.status >= 400) {
          console.error(`Error fetching solution descriptions: ${response.status}`, response.data);
          throw new Error(`Error fetching solution descriptions: ${response.status}`);
        }

        // Ensure we always return an array
        if (!Array.isArray(response.data)) {
          console.warn('Solution descriptions response is not an array:', response.data);
          return response.data ? [response.data] : [];
        }

        // Check if the array is empty
        if (response.data.length === 0) {
          console.warn('Solution descriptions array is empty, will try fallback endpoint');
          throw new Error('Empty solution descriptions array');
        }

        // Process the response data to ensure hero_image is properly handled
        const processedData = response.data.map((item: any) => {
          try {
            // Log detailed info for debugging
            console.log(`Processing solution description: ID=${item.id}, Title=${item.title}`);
            console.log(`Raw hero_image: ${item.hero_image}`);

            // Check if hero_image is a valid URL
            if (item.hero_image && item.hero_image.startsWith('/api/')) {
              console.log(`Fixing incorrect API URL: ${item.hero_image}`);
              item.hero_image = item.hero_image.replace('/api/', '/media/');
              console.log(`Fixed to: ${item.hero_image}`);
            }

            return {
              ...item,
              // Fix the hero_image URL if needed
              hero_image: item.hero_image ? fixImageUrl(item.hero_image) : null,
              // Ensure we have createdAt and updatedAt properties
              createdAt: item.created_at || item.createdAt,
              updatedAt: item.updated_at || item.updatedAt
            };
          } catch (itemError) {
            console.error(`Error processing solution description item:`, itemError);
            // Return the original item if processing fails
            return item;
          }
        });

        console.log(`Processed ${processedData.length} solution descriptions`);
        console.log(`First processed item:`, JSON.stringify(processedData[0], null, 2));
        return processedData;
      } catch (endpointError) {
        console.error('Error with solution-descriptions endpoint, trying solutions endpoint:', endpointError);

        // If the solution-descriptions endpoint fails, try the solutions endpoint
        console.log('Making request to /solutions/ endpoint');
        const fallbackResponse = await apiClient.get('/solutions/', {
          headers: getAuthHeaders(),
          timeout: 10000
        });

        console.log('Fallback solutions response status:', fallbackResponse.status);
        console.log('Fallback solutions response data:', JSON.stringify(fallbackResponse.data, null, 2));

        if (!Array.isArray(fallbackResponse.data)) {
          return fallbackResponse.data ? [fallbackResponse.data] : [];
        }

        // Process the fallback response
        const processedFallbackData = fallbackResponse.data.map((item: any) => {
          console.log(`Processing fallback solution: ID=${item.id}, Title=${item.title}`);
          console.log(`Raw hero_image: ${item.hero_image}`);

          // Check if hero_image is a valid URL
          if (item.hero_image && item.hero_image.startsWith('/api/')) {
            console.log(`Fixing incorrect API URL: ${item.hero_image}`);
            item.hero_image = item.hero_image.replace('/api/', '/media/');
            console.log(`Fixed to: ${item.hero_image}`);
          }

          return {
            id: item.id,
            title: item.title || 'Untitled Solution',
            description: item.description || '',
            hero_image: item.hero_image ? fixImageUrl(item.hero_image) : null,
            created_at: item.created_at,
            updated_at: item.updated_at,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          };
        });

        console.log(`Processed ${processedFallbackData.length} fallback solution descriptions`);
        if (processedFallbackData.length > 0) {
          console.log(`First processed fallback item:`, JSON.stringify(processedFallbackData[0], null, 2));
        }
        return processedFallbackData;
      }
    } catch (error) {
      console.error('Error fetching solution descriptions:', error);
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  },

  // Override create to handle FormData
  create: async (formData: FormData) => {
    try {
      console.log('Creating solution description with FormData');

      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // Make the request without Content-Type header for FormData
      const response = await apiClient.post('/solution-descriptions/', formData, {
        headers: {
          ...getAuthHeaders(true),
        },
        // This is critical - it tells axios not to set Content-Type
        // The browser will automatically set the correct multipart/form-data with boundary
        transformRequest: [(data, headers) => {
          if (headers) delete headers['Content-Type'];
          return data;
        }],
        // Add timeout to prevent hanging requests
        timeout: 30000, // 30 seconds timeout
        // Add validateStatus to handle non-200 responses
        validateStatus: (status) => status < 500
      });

      console.log('Solution description creation response:', response);

      if (response.status >= 400) {
        console.error(`Error creating solution description: ${response.status}`, response.data);
        throw new Error(JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error('Error creating solution description:', error);
      throw error;
    }
  },

  // Override update to handle FormData
  update: async (id: string | number, formData: FormData) => {
    try {
      console.log(`Updating solution description ${id} with FormData`);

      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // Make the request without Content-Type header for FormData
      const response = await apiClient.patch(`/solution-descriptions/${id}/`, formData, {
        headers: {
          ...getAuthHeaders(true),
        },
        // This is critical - it tells axios not to set Content-Type
        // The browser will automatically set the correct multipart/form-data with boundary
        transformRequest: [(data, headers) => {
          if (headers) delete headers['Content-Type'];
          return data;
        }],
        // Add timeout to prevent hanging requests
        timeout: 30000, // 30 seconds timeout
        // Add validateStatus to handle non-200 responses
        validateStatus: (status) => status < 500
      });

      console.log('Solution description update response:', response);

      if (response.status >= 400) {
        console.error(`Error updating solution description: ${response.status}`, response.data);
        throw new Error(JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating solution description ${id}:`, error);
      throw error;
    }
  }
};
// Create a custom implementation for newsDescriptionService
const baseNewsDescriptionService = createService<NewsDescription>('news-descriptions', true);
export const newsDescriptionService = {
  ...baseNewsDescriptionService,

  // Override getAll to ensure it always returns an array
  getAll: async () => {
    try {
      console.log('Fetching all news descriptions');
      console.log('Request URL:', '/news-descriptions/');

      // For public pages, don't require authentication
      const headers = {};

      console.log('Request headers:', headers);

      const response = await apiClient.get('/news-descriptions/', {
        headers: headers
      });

      console.log('News descriptions response status:', response.status);
      console.log('News descriptions response headers:', response.headers);
      console.log('News descriptions response data:', response.data);

      // Ensure we always return an array
      if (!Array.isArray(response.data)) {
        console.warn('News descriptions response is not an array:', response.data);
        // If it's an object with an id, treat it as a single item
        if (response.data && typeof response.data === 'object' && response.data.id) {
          console.log('Converting single object to array:', response.data);

          // Check if hero_image exists
          if (response.data.hero_image) {
            console.log('Hero image found in response:', response.data.hero_image);
            console.log('Hero image type:', typeof response.data.hero_image);

            // Fix the hero_image URL
            const fixedImageUrl = fixImageUrl(response.data.hero_image);
            console.log('Fixed hero image URL:', fixedImageUrl);

            const singleItem = {
              ...response.data,
              hero_image: fixedImageUrl
            };

            console.log('Processed single item:', singleItem);
            return [singleItem];
          } else {
            console.warn('No hero_image found in response data:', response.data);
            const singleItem = {
              ...response.data,
              hero_image: null
            };
            return [singleItem];
          }
        }
        // Otherwise return empty array
        console.warn('Response data is not an array and does not have an id property');
        return [];
      }

      // Process the response data to ensure hero_image is properly handled
      const processedData = response.data.map((item: any) => {
        console.log('Processing news description item:', item);

        // Check if hero_image exists
        if (item.hero_image) {
          console.log('Hero image found in item:', item.hero_image);
          console.log('Hero image type:', typeof item.hero_image);

          // Fix the hero_image URL
          const fixedImageUrl = fixImageUrl(item.hero_image);
          console.log('Fixed hero image URL:', fixedImageUrl);

          return {
            ...item,
            hero_image: fixedImageUrl
          };
        } else {
          console.warn('No hero_image found in item:', item);
          return {
            ...item,
            hero_image: null
          };
        }
      });

      console.log('Processed news descriptions data:', processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching news descriptions:', error);
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  },

  // Override create to handle FormData
  create: async (formData: FormData) => {
    try {
      console.log('Creating news description with FormData');

      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // Make the request without Content-Type header for FormData
      console.log('Sending POST request to /news-descriptions/ with FormData');
      const response = await apiClient.post('/news-descriptions/', formData, {
        headers: {
          ...getAuthHeaders(true),
        },
        // This is critical - it tells axios not to set Content-Type
        transformRequest: [(data, headers) => {
          if (headers) {
            delete headers['Content-Type'];
            console.log('Removed Content-Type header for FormData request');
            console.log('Final request headers:', headers);
          }
          return data;
        }],
        // Add timeout to prevent hanging requests
        timeout: 30000, // 30 seconds timeout
        validateStatus: (status) => status < 500
      });

      console.log('News description creation response status:', response.status);
      console.log('News description creation response headers:', response.headers);
      console.log('News description creation response data:', response.data);

      if (response.status >= 400) {
        console.error(`Error creating news description: ${response.status}`, response.data);
        throw new Error(JSON.stringify(response.data));
      }

      // Log the hero_image field in the response
      if (response.data && response.data.hero_image) {
        console.log('Hero image in response:', response.data.hero_image);
        console.log('Hero image type:', typeof response.data.hero_image);
      } else {
        console.warn('No hero_image field in response data:', response.data);
      }

      return response.data;
    } catch (error) {
      console.error('Error creating news description:', error);
      throw error;
    }
  },

  // Override update to handle FormData
  update: async (id: string | number, formData: FormData) => {
    try {
      console.log(`Updating news description ${id} with FormData`);

      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // Make the request without Content-Type header for FormData
      console.log(`Sending PATCH request to /news-descriptions/${id}/ with FormData`);
      const response = await apiClient.patch(`/news-descriptions/${id}/`, formData, {
        headers: {
          ...getAuthHeaders(true),
        },
        // This is critical - it tells axios not to set Content-Type
        transformRequest: [(data, headers) => {
          if (headers) {
            delete headers['Content-Type'];
            console.log('Removed Content-Type header for FormData request');
            console.log('Final request headers:', headers);
          }
          return data;
        }],
        // Add timeout to prevent hanging requests
        timeout: 30000, // 30 seconds timeout
        validateStatus: (status) => status < 500
      });

      console.log('News description update response status:', response.status);
      console.log('News description update response headers:', response.headers);
      console.log('News description update response data:', response.data);

      if (response.status >= 400) {
        console.error(`Error updating news description: ${response.status}`, response.data);
        throw new Error(JSON.stringify(response.data));
      }

      // Log the hero_image field in the response
      if (response.data && response.data.hero_image) {
        console.log('Hero image in response:', response.data.hero_image);
        console.log('Hero image type:', typeof response.data.hero_image);
      } else {
        console.warn('No hero_image field in response data:', response.data);
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating news description ${id}:`, error);
      throw error;
    }
  }
};
// newsService is already defined above with custom implementation
export const contactsService = createService<ContactMessage>('contacts');
// contactInfoService is already defined above with custom implementation
// contactDescriptionService is already defined above with custom implementation
// Create a custom implementation for heroSectionService
const baseHeroSectionService = createService<HeroSection>('hero-section', true);
export const heroSectionService = {
  ...baseHeroSectionService,

  // Override getAll to add better logging - simplified like Solutions page
  getAll: async (): Promise<HeroSection[]> => {
    try {
      console.log('API Service - Fetching hero section data');

      // Create a completely fresh request with cache busting
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(7);

      // Use fetch directly to bypass any caching
      const fetchResponse = await fetch(`http://localhost:8000/api/hero-section/?_t=${timestamp}&r=${randomString}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-Modified-Since': '0',
        },
        cache: 'no-store'
      });

      if (!fetchResponse.ok) {
        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }

      const data = await fetchResponse.json();
      console.log('API Service - Hero section raw data:', data);

      // Process the response data to ensure background_image is properly handled
      const processedData = Array.isArray(data) ? data.map((item: HeroSection) => {
        console.log(`API Service - Processing hero item ID=${item.id}`);

        if (item.background_image) {
          console.log(`API Service - Raw background_image: ${item.background_image}`);

          // Add multiple cache busting parameters
          const imgTimestamp = new Date().getTime();
          const imgRandomString = Math.random().toString(36).substring(7);

          // Force a completely new URL to bypass all caching
          item.background_image = `${item.background_image.split('?')[0]}?_t=${imgTimestamp}&r=${imgRandomString}&v=${Math.floor(Math.random() * 1000000)}`;

          console.log(`API Service - Background image with cache busting: ${item.background_image}`);
        }

        return item;
      }) : [];

      console.log('API Service - Returning hero section data:', processedData);
      return processedData;
    } catch (error) {
      console.error('API Service - Error fetching hero section:', error);
      return [];
    }
  },

  // Override create to add better logging
  create: async (formData: FormData): Promise<HeroSection> => {
    try {
      console.log('API Service - Creating hero section');

      // Log FormData contents for debugging
      console.log('API Service - FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      const response = await apiClient.post('/hero-section/', formData, {
        headers: {
          ...getAuthHeaders(true),
        },
        transformRequest: [(data, headers) => {
          if (headers) delete headers['Content-Type'];
          return data;
        }]
      });

      console.log('API Service - Hero section creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Service - Error creating hero section:', error);
      throw error;
    }
  },

  // Override update to add better logging
  update: async (id: string | number, formData: FormData): Promise<HeroSection> => {
    try {
      console.log(`API Service - Updating hero section ${id}`);

      // Log FormData contents for debugging
      console.log('API Service - FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      const response = await apiClient.patch(`/hero-section/${id}/`, formData, {
        headers: {
          ...getAuthHeaders(true),
        },
        transformRequest: [(data, headers) => {
          if (headers) delete headers['Content-Type'];
          return data;
        }]
      });

      console.log('API Service - Hero section update response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`API Service - Error updating hero section ${id}:`, error);
      throw error;
    }
  }
};
export const featuresService = createService<Feature>('features', true);
export const targetMarketsService = createService<TargetMarket>('target-markets', true);
export const whyChooseUsService = createService<WhyChooseUs>('why-choose-us', true);
// userService is already defined above with custom implementation
export const navigationService = createService<NavigationItem>('navigation', true);

// About page services
// Create a custom implementation for aboutHeroService
const baseAboutHeroService = createService<AboutHero>('about-hero', true);
export const aboutHeroService = {
  ...baseAboutHeroService,

  // Override getAll to add better logging and image handling
  getAll: async (): Promise<AboutHero[]> => {
    try {
      console.log('API Service - Fetching about hero data');

      // Use the standard apiClient with cache busting
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(7);

      const response = await apiClient.get(`/about-hero/?_t=${timestamp}&r=${randomString}`);
      const data = response.data;

      console.log('API Service - About hero raw data:', data);

      // Process the response data to ensure background_image is properly handled
      const processedData = Array.isArray(data) ? data : [];

      console.log('API Service - Processed about hero data:', processedData);
      return processedData;
    } catch (error) {
      console.error('API Service - Error fetching about hero data:', error);
      return [];
    }
  },

  // Override create to add better logging
  create: async (formData: FormData): Promise<AboutHero> => {
    try {
      console.log('API Service - Creating about hero section');

      // Log FormData contents for debugging
      console.log('API Service - FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      const response = await apiClient.post('/about-hero/', formData, {
        headers: {
          ...getAuthHeaders(true),
        },
        transformRequest: [(data, headers) => {
          if (headers) delete headers['Content-Type'];
          return data;
        }]
      });

      console.log('API Service - About hero section create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Service - Error creating about hero section:', error);
      throw error;
    }
  },

  // Override update to add better logging
  update: async (id: string | number, formData: FormData): Promise<AboutHero> => {
    try {
      console.log(`API Service - Updating about hero section ${id}`);

      // Log FormData contents for debugging
      console.log('API Service - FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      const response = await apiClient.patch(`/about-hero/${id}/`, formData, {
        headers: {
          ...getAuthHeaders(true),
        },
        transformRequest: [(data, headers) => {
          if (headers) delete headers['Content-Type'];
          return data;
        }]
      });

      console.log('API Service - About hero section update response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`API Service - Error updating about hero section ${id}:`, error);
      throw error;
    }
  }
};
export const companyOverviewService = createService<CompanyOverview>('company-overview', true);
export const missionVisionService = createService<MissionVision>('mission-vision', true);
export const teamMemberService = createService<TeamMember>('team-members', true);
// Create a custom implementation for teamDescriptionService
const baseTeamDescriptionService = createService<TeamDescription>('team-descriptions', true);
export const teamDescriptionService = {
  ...baseTeamDescriptionService,

  // Override getAll to ensure it always returns an array
  getAll: async () => {
    try {
      console.log('Fetching all team descriptions');
      const response = await apiClient.get('/team-descriptions/', {
        headers: getAuthHeaders()
      });
      console.log('Team descriptions response:', response.data);

      // Ensure we always return an array
      if (!Array.isArray(response.data)) {
        console.warn('Team descriptions response is not an array:', response.data);
        return response.data ? [response.data] : [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching team descriptions:', error);
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  }
};
export const partnersService = createService<Partner>('partners', true);
// Create a custom implementation for partnerDescriptionService
const basePartnerDescriptionService = createService<PartnerDescription>('partner-descriptions', true);
export const partnerDescriptionService = {
  ...basePartnerDescriptionService,

  // Override getAll to ensure it always returns an array
  getAll: async () => {
    try {
      console.log('Fetching all partner descriptions');
      const response = await apiClient.get('/partner-descriptions/', {
        headers: getAuthHeaders()
      });
      console.log('Partner descriptions response:', response.data);

      // Ensure we always return an array
      if (!Array.isArray(response.data)) {
        console.warn('Partner descriptions response is not an array:', response.data);
        return response.data ? [response.data] : [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching partner descriptions:', error);
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  }
};

// Settings service
export const settingsService = createService<SiteSettings>('site-settings');






















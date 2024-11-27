// Base API URL - will be proxied in development
const API_URL = '/api';

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    reason?: string;
  }>;
}

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  totalProducts: number;
  pendingOrders: number;
  systemHealth: {
    status: string;
    lastBackup: string;
    serverLoad: number;
    lastError: string | null;
  };
  recentActivity: {
    newUsers: number;
    recentOrders: number;
  };
  userStats: {
    customers: number;
    admins: number;
    inactiveUsers: number;
  };
}

interface SystemLog {
  _id: string;
  level: string;
  message: string;
  timestamp: string;
  user?: string;
  action?: string;
  details?: any;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: Array<{ url: string; alt: string }>;
  specifications: Array<{ name: string; value: string }>;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  tags: string[];
  status: string;
  vendor: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'vendor';
  storeDetails?: {
    storeName?: string;
    description?: string;
    address?: string;
    phone?: string;
    logo?: string;
  };
}

export async function register(data: RegistrationData) {
  try {
    console.log('Sending registration request:', { 
      ...data, 
      password: '[REDACTED]' 
    });

    const response = await api.post('/auth/register', {
      ...data,
      role: data.role || 'user',
      storeDetails: data.role === 'vendor' ? {
        storeName: data.storeDetails?.storeName?.trim(),
        description: data.storeDetails?.description?.trim(),
        address: data.storeDetails?.address?.trim(),
        phone: data.storeDetails?.phone?.trim()
      } : undefined
    });

    console.log('Registration successful:', { 
      ...response.data,
      tokens: '[REDACTED]' 
    });
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Handle specific error cases
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid registration data');
    }
    if (error.response?.status === 409) {
      throw new Error('Email already exists');
    }
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
  }
}

export async function login(data: { email: string; password: string; role?: string }): Promise<LoginResponse> {
  try {
    // Ensure email is lowercase
    const loginData = {
      ...data,
      email: data.email.toLowerCase(),
      role: data.role || 'vendor' // Default to vendor role for vendor login page
    };

    const response = await api.post('/auth/login', loginData);
    
    if (!response.data || !response.data.tokens || !response.data.tokens.accessToken) {
      throw new Error('Invalid server response');
    }

    // Store tokens
    localStorage.setItem('token', response.data.tokens.accessToken);
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    return response.data;
  } catch (error: any) {
    console.error('Login error details:', error.response?.data);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Login failed. Please try again.');
  }
}

export async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export async function fetchProfile(): Promise<ProfileResponse> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await api.get('/auth/profile');
    
    if (!response.data) {
      throw new Error('No profile data received');
    }

    return response.data;
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }

    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please log in again.');
    }

    if (error.response.status === 404) {
      throw new Error('Profile not found. Please log in again.');
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Failed to load profile data. Please try again.');
  }
}

export async function updateProfile(data: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<ProfileResponse> {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Profile update error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please log in again.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to update profile. Please try again.');
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const response = await api.get('/admin/analytics');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch admin statistics. Please try again.');
  }
}

export async function deleteUser(userId: string) {
  try {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to delete user. Please try again.');
  }
}

export async function fetchSystemLogs(filter: string = 'all'): Promise<SystemLog[]> {
  try {
    const response = await api.get(`/admin/logs?filter=${filter}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch system logs. Please try again.');
  }
}

export async function createProduct(data: FormData): Promise<Product> {
  try {
    const response = await api.post('/vendor/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to create product. Please try again.');
  }
}

export async function updateProduct(productId: string, data: FormData): Promise<Product> {
  try {
    const response = await api.put(`/vendor/products/${productId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to update product. Please try again.');
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    await api.delete(`/vendor/products/${productId}`);
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to delete product. Please try again.');
  }
}

export async function fetchVendorProducts(
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ProductsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    const response = await api.get(`/vendor/products?${params}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch products. Please try again.');
  }
}

export async function fetchVendorDashboardStats(): Promise<{
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  averageRating: number;
}> {
  try {
    const response = await api.get('/vendor/dashboard');
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch dashboard stats. Please try again.');
  }
}

export async function resetVendorPassword(email: string): Promise<{ message: string; email: string; newPassword: string }> {
  try {
    const response = await api.post('/auth/reset-vendor-password', { email });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to reset password. Please try again.');
  }
}
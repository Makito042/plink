import axios from 'axios';
import { Product } from '../types';

const api = axios.create({
  baseURL: '/api/store',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchProductById(id: string): Promise<Product> {
  try {
    const response = await api.get(`/products/${id}`);
    
    // Transform the product to ensure frontend compatibility
    return {
      ...response.data,
      id: response.data._id || response.data.id,
      inStock: response.data.stock > 0
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    
    // Check if it's an Axios error with a response
    if (axios.isAxiosError(error) && error.response) {
      // Log detailed error information
      console.error('Error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Throw a more informative error
      throw new Error(
        error.response.data.message || 
        `Failed to fetch product. Status: ${error.response.status}`
      );
    }
    
    throw error;
  }
}

export async function fetchStoreProducts(params: {
  page?: number;
  limit?: number;
  category?: string;
  includeOutOfStock?: boolean;
} = {}): Promise<{ 
  products: Product[]; 
  totalProducts: number; 
  totalPages: number; 
  currentPage: number; 
}> {
  try {
    const response = await api.get('/products', { params });
    
    // Transform products to ensure frontend compatibility
    return {
      ...response.data,
      products: response.data.products.map((product: Product) => ({
        ...product,
        id: product._id || product.id,
        inStock: product.stock > 0
      })),
      totalProducts: response.data.totalProducts,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage
    };
  } catch (error) {
    console.error('Error fetching store products:', error);
    
    // Check if it's an Axios error with a response
    if (axios.isAxiosError(error) && error.response) {
      // Log detailed error information
      console.error('Error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Throw a more informative error
      throw new Error(
        error.response.data.message || 
        `Failed to fetch products. Status: ${error.response.status}`
      );
    }
    
    throw error;
  }
}

export interface ProductImage {
  url: string;
  alt: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    hasAlpha?: boolean;
    isAnimated?: boolean;
  };
  order?: number;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: ProductImage[];
  vendor?: string;
  manufacturer?: string;
  inStock?: boolean;
  status?: 'draft' | 'published' | 'outOfStock' | 'discontinued';
}

export interface CartItem extends Product {
  quantity: number;
}
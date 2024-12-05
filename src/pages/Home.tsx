import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchStoreProducts } from '../services/productService';
import { Product } from '../types';

const categories = [
  {
    name: 'Vitamins & Supplements',
    path: '/category/vitamins',
    icon: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80'
  },
  {
    name: 'Personal Care',
    path: '/category/personal-care',
    icon: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80'
  },
  {
    name: 'Medical Devices',
    path: '/category/medical-devices',
    icon: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80'
  },
  {
    name: 'First Aid',
    path: '/category/first-aid',
    icon: 'https://images.unsplash.com/photo-1576765608689-c5bded4669f4?auto=format&fit=crop&q=80'
  }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchStoreProducts({
          page: 1,
          limit: 8,
          // Optional: Add more filters like specific category
        });
        setFeaturedProducts(response.products);
      } catch (err: any) {
        console.error('Failed to load featured products:', err);
        
        // Handle specific authentication errors
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          // Redirect to login or handle authentication
          console.warn('Authentication required to fetch products');
          // Optionally: window.location.href = '/login';
        }
        
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#004d00] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Health, Delivered
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Quality healthcare products at your fingertips
            </p>
            <Link
              to="/category/all"
              className="inline-flex items-center bg-white text-[#004d00] px-6 py-3 rounded-lg font-semibold hover:bg-[#66cc66] hover:text-white transition-colors"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link
            to="/category/all"
            className="text-[#004d00] hover:text-[#003300] font-semibold flex items-center"
          >
            View All
            <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">Error: {error}</div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-8">No products found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="relative rounded-lg overflow-hidden group"
            >
              <img
                src={category.icon}
                alt={category.name}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-xl font-semibold text-center">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
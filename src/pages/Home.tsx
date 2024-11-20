import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Vitamin C Complex',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80',
    category: 'Vitamins & Supplements',
    description: 'High-quality Vitamin C supplement for immune support',
    inStock: true,
  },
  {
    id: '2',
    name: 'First Aid Kit',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80',
    category: 'Personal Care',
    description: 'Complete emergency first aid kit for home use',
    inStock: true,
  },
  {
    id: '3',
    name: 'Pain Relief Gel',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80',
    category: 'Over-the-Counter',
    description: 'Fast-acting pain relief gel for muscle aches',
    inStock: true,
  },
];

export default function Home() {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              name: 'Vitamins & Supplements',
              image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80',
              path: '/category/vitamins',
            },
            {
              name: 'Personal Care',
              image: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&q=80',
              path: '/category/personal-care',
            },
            {
              name: 'Over-the-Counter',
              image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80',
              path: '/category/otc',
            },
            {
              name: 'Medical Devices',
              image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80',
              path: '/category/medical-devices',
            },
          ].map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="relative rounded-lg overflow-hidden group"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-xl font-semibold text-center">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
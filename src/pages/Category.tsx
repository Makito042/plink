import { Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

const products: Product[] = [
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
  {
    id: '4',
    name: 'Digital Thermometer',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80',
    category: 'Medical Devices',
    description: 'Accurate digital thermometer for temperature monitoring',
    inStock: true,
  },
];

export default function Category() {
  const { category } = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category}</h1>
          <p className="text-gray-600">Browse our selection of quality healthcare products</p>
        </div>

        {/* Mobile Filter Button */}
        <button
          className="md:hidden w-full bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-center space-x-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filter Products</span>
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Filter className="w-5 h-5" />
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="20000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₦{priceRange[0].toLocaleString()}</span>
                    <span>₦{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="font-medium mb-2">Brands</h3>
                <div className="space-y-2">
                  {['Brand A', 'Brand B', 'Brand C', 'Brand D'].map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-gray-300 text-[#004d00] focus:ring-[#004d00]"
                      />
                      <span className="ml-2 text-sm text-gray-600">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
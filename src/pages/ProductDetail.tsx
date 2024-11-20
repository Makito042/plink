import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { Product } from '../types';

// This would typically come from an API
const product: Product = {
  id: '1',
  name: 'Vitamin C Complex',
  price: 5000,
  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80',
  category: 'Vitamins & Supplements',
  description: 'High-quality Vitamin C supplement for immune support. Contains ascorbic acid and citrus bioflavonoids for enhanced absorption.',
  inStock: true,
};

const relatedProducts: Product[] = [
  {
    id: '2',
    name: 'Vitamin D3',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f7e?auto=format&fit=crop&q=80',
    category: 'Vitamins & Supplements',
    description: 'Essential vitamin D3 supplement for bone health',
    inStock: true,
  },
  {
    id: '3',
    name: 'Zinc Complex',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80',
    category: 'Vitamins & Supplements',
    description: 'Zinc supplement for immune system support',
    inStock: true,
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8">
          <ol className="flex items-center space-x-2">
            <li><a href="/" className="text-gray-500 hover:text-[#004d00]">Home</a></li>
            <li><span className="text-gray-500">/</span></li>
            <li><a href="/category/vitamins" className="text-gray-500 hover:text-[#004d00]">{product.category}</a></li>
            <li><span className="text-gray-500">/</span></li>
            <li className="text-[#004d00]">{product.name}</li>
          </ol>
        </nav>

        {/* Product Info */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-2xl font-bold text-[#004d00] mb-6">{formatCurrency(product.price)}</p>
              
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#004d00] text-white px-6 py-3 rounded-lg hover:bg-[#003300] transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Product Features:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>High-quality Vitamin C formulation</li>
                  <li>Enhanced absorption with bioflavonoids</li>
                  <li>Supports immune system function</li>
                  <li>Made in Rwanda under strict quality control</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b">
            <nav className="flex">
              {(['description', 'details', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-[#004d00] text-[#004d00]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  Our Vitamin C Complex is a premium supplement designed to support your immune system
                  and overall health. Each tablet contains a powerful blend of ascorbic acid and
                  natural citrus bioflavonoids for enhanced absorption and effectiveness.
                </p>
              </div>
            )}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Serving Size</h4>
                    <p className="text-gray-600">1 tablet</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Package Contents</h4>
                    <p className="text-gray-600">60 tablets</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Storage</h4>
                    <p className="text-gray-600">Store in a cool, dry place</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Manufacturer</h4>
                    <p className="text-gray-600">PharmaLink Rwanda Ltd</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Customer Reviews</h3>
                  <button className="text-[#004d00] hover:text-[#003300]">Write a Review</button>
                </div>
                <div className="space-y-4">
                  {/* Sample reviews */}
                  <div className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold mr-2">John D.</span>
                      <span className="text-gray-500">Verified Purchase</span>
                    </div>
                    <p className="text-gray-600">Great product! I've noticed a significant improvement in my immune system since taking these supplements.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md p-4">
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                <p className="text-[#004d00] font-bold">{formatCurrency(relatedProduct.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
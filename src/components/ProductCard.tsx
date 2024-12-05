import { Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  // Select the first image or use a placeholder
  const productImage = product.images && product.images.length > 0 
    ? product.images[0].url 
    : 'https://via.placeholder.com/300x300?text=No+Image';

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigating to product detail
    event.stopPropagation(); // Stop event from bubbling
    addItem(product);
  };

  return (
    <Link 
      to={`/product/${product.id || product._id}`} 
      className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="relative">
        <img 
          src={productImage} 
          alt={product.images?.[0]?.alt || product.name} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={handleAddToCart}
            className="bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
            aria-label="Add to Cart"
          >
            <ShoppingCart className="w-5 h-5 text-[#004d00]" />
          </button>
          <button 
            className="bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
            aria-label="Add to Favorites"
          >
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-[#004d00] font-bold text-xl">
            {formatCurrency(product.price)}
          </span>
          <span 
            className={`text-sm font-medium ${
              product.inStock ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}
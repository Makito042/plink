import { Heart, Minus, Plus, ShoppingCart, AlertCircle, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { Product } from '../types';
import { fetchProductById } from '../services/productService';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('No product ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedProduct = await fetchProductById(id);
        setProduct(fetchedProduct);
      } catch (err: any) {
        console.error('Failed to fetch product:', err);
        setError(
          err.message || 
          'Unable to load product details. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
    }
  };

  const handleSubmitReview = () => {
    if (!review.trim() || rating === 0) {
      alert('Please provide a rating and review');
      return;
    }
    // TODO: Implement review submission logic
    console.log('Submitting review:', { rating, review });
    // Reset form after submission
    setReview('');
    setRating(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-600">
          Loading product details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/" 
              className="bg-[#004d00] text-white px-6 py-3 rounded-lg hover:bg-[#003300] transition-colors"
            >
              Back to Home
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">
          No product found
        </div>
      </div>
    );
  }

  // Get the first image or use a placeholder
  const primaryImage = product.images && product.images.length > 0 
    ? product.images[0].url 
    : 'https://via.placeholder.com/600x600?text=No+Image';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="text-gray-500 hover:text-[#004d00]">Home</Link></li>
            <li><span className="text-gray-500">/</span></li>
            <li><Link to={`/category/${product.category}`} className="text-gray-500 hover:text-[#004d00]">{product.category}</Link></li>
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
                src={primaryImage}
                alt={product.images?.[0]?.alt || product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {/* Image Gallery (optional) */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 mt-4">
                  {product.images.slice(1, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={image.alt || `Product image ${index + 2}`}
                      className="w-20 h-20 object-cover rounded cursor-pointer"
                    />
                  ))}
                </div>
              )}
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
            </div>
          </div>

          {/* Product Information Tabs */}
          <div className="mt-8">
            {/* Tab Navigation */}
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

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                  {/* Vendor can add more details here */}
                  {product.specifications && product.specifications.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {product.specifications.map((spec, index) => (
                        <div key={index}>
                          <h4 className="font-semibold">{spec.name}</h4>
                          <p className="text-gray-600">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No additional details available</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                  </div>

                  {/* Review Submission Form */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-md font-semibold mb-4">Write a Review</h4>
                    <div className="flex items-center mb-4">
                      <span className="mr-4">Your Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 cursor-pointer ${
                            star <= rating ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your experience with this product"
                      className="w-full p-3 border rounded-lg mb-4"
                      rows={4}
                    />
                    <button
                      onClick={handleSubmitReview}
                      className="bg-[#004d00] text-white px-6 py-3 rounded-lg hover:bg-[#003300] transition-colors"
                    >
                      Submit Review
                    </button>
                  </div>

                  {/* Existing Reviews */}
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {product.reviews.map((review, index) => (
                        <div key={index} className="border-b pb-4">
                          <div className="flex items-center mb-2">
                            <span className="font-semibold mr-2">
                              {review.user ? 'User' : 'Anonymous'}
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (review.rating || 0) 
                                      ? 'text-yellow-500' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all products with pagination and filtering
router.get('/products', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      includeOutOfStock = false 
    } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }
    if (!includeOutOfStock) {
      query.stock = { $gt: 0 }; // Only products with stock > 0
    }

    // Perform query with pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNumber);

    const products = await Product.find(query)
      .select('-__v') // Exclude version key
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 }); // Sort by most recent first

    res.json({
      products,
      totalProducts,
      totalPages,
      currentPage: pageNumber
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Failed to fetch products', 
      error: error.message 
    });
  }
});

// Get a single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid product ID' 
      });
    }

    res.status(500).json({ 
      message: 'Failed to fetch product', 
      error: error.message 
    });
  }
});

export default router;

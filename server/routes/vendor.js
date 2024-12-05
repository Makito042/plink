import express from 'express';
import { auth } from '../middleware/auth.js';
import { processImages } from '../middleware/imageProcessing.js';
import Product from '../models/Product.js';
import multer from 'multer';
import mongoose from 'mongoose';
import path from 'path';
import { parse } from 'csv-parse/sync';
import xlsx from 'xlsx';
import fs from 'fs';

const router = express.Router();

// Middleware to ensure vendor access
const requireVendor = async (req, res, next) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Access denied. Vendor privileges required.' });
  }
  next();
};

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: './uploads/products',
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
}).array('images', 5); // Allow up to 5 images

// Configure multer for bulk file upload
const bulkStorage = multer.diskStorage({
  destination: './uploads/temp',
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const bulkUpload = multer({
  storage: bulkStorage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /json|xlsx|xls|csv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JSON, Excel, or CSV files are allowed!'));
  }
}).single('file');

// Middleware to handle file upload
router.use(auth);

// Create a new product
router.post('/products', requireVendor, async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err) {
        return res.status(400).json({ 
          message: 'Image upload failed',
          error: err.message 
        });
      }

      // Process uploaded images
      await processImages(req, res, async () => {
        try {
          const {
            name,
            description,
            price,
            category,
            stock,
            specifications,
            dimensions,
            tags,
            status = 'draft' // Add optional status parameter
          } = req.body;

          // Process uploaded images
          const images = req.files ? req.files.map(file => ({
            url: `/uploads/products/${file.filename}`,
            alt: name,
            metadata: file.metadata // Add image metadata
          })) : [];

          const newProduct = new Product({
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            vendor: req.user.id,
            specifications: specifications ? JSON.parse(specifications) : {},
            dimensions: dimensions ? JSON.parse(dimensions) : {},
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            images,
            status: ['draft', 'published', 'outOfStock', 'discontinued'].includes(status) 
              ? status 
              : 'draft' // Validate status
          });

          await newProduct.save();

          res.status(201).json({
            message: 'Product created successfully',
            product: newProduct
          });
        } catch (error) {
          console.error('Error creating product:', error);
          res.status(500).json({ 
            message: 'Failed to create product', 
            error: error.message 
          });
        }
      });
    });
  } catch (error) {
    console.error('Unexpected error in product creation:', error);
    res.status(500).json({ 
      message: 'Unexpected error occurred', 
      error: error.message 
    });
  }
});

// Bulk upload products
router.post('/products/bulk', requireVendor, async (req, res) => {
  try {
    bulkUpload(req, res, async function(err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      let products = [];
      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();

      // Parse file based on type
      if (fileExt === '.json') {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        products = JSON.parse(fileContent);
      } else if (fileExt === '.csv') {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
          products = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
          });
        } catch (err) {
          console.error('CSV parsing error:', err);
          throw new Error('Failed to parse CSV file');
        }
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        products = xlsx.utils.sheet_to_json(worksheet);
      }

      // Clean up temp file
      fs.unlinkSync(filePath);

      // Validate and format products
      const formattedProducts = products.map(product => ({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: product.category,
        stock: parseInt(product.stock),
        vendor: req.user._id,
        dimensions: {
          length: parseFloat(product.length) || 0,
          width: parseFloat(product.width) || 0,
          height: parseFloat(product.height) || 0,
          weight: parseFloat(product.weight) || 0,
        },
        specifications: product.specifications || [],
        tags: product.tags ? product.tags.split(',').map(tag => tag.trim()) : []
      }));

      // Insert products
      await Product.insertMany(formattedProducts);

      res.status(200).json({
        message: `Successfully uploaded ${formattedProducts.length} products`,
        count: formattedProducts.length
      });
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      message: 'Error uploading products',
      error: error.message
    });
  }
});

// Get vendor's products
router.get('/products', requireVendor, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { vendor: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Update product
router.put('/products/:productId', requireVendor, async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err) {
        return res.status(400).json({ 
          message: 'Image upload failed',
          error: err.message 
        });
      }

      // Process uploaded images
      await processImages(req, res, async () => {
        try {
          const { productId } = req.params;
          const {
            name,
            description,
            price,
            category,
            stock,
            specifications,
            dimensions,
            tags
          } = req.body;

          // Find the product
          const product = await Product.findOne({
            _id: productId,
            vendor: req.user.id
          });

          if (!product) {
            return res.status(404).json({ message: 'Product not found' });
          }

          // Process uploaded images
          const newImages = req.files ? req.files.map(file => ({
            url: `/uploads/products/${file.filename}`,
            alt: name,
            metadata: file.metadata // Add image metadata
          })) : [];

          // Update product details
          product.name = name;
          product.description = description;
          product.price = parseFloat(price);
          product.category = category;
          product.stock = parseInt(stock);
          product.specifications = specifications ? JSON.parse(specifications) : {};
          product.dimensions = dimensions ? JSON.parse(dimensions) : {};
          product.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
          
          // Merge existing and new images
          product.images = [...product.images, ...newImages];
          product.updatedAt = new Date();

          await product.save();

          res.json({
            message: 'Product updated successfully',
            product
          });
        } catch (error) {
          console.error('Error updating product:', error);
          res.status(500).json({ 
            message: 'Failed to update product', 
            error: error.message 
          });
        }
      });
    });
  } catch (error) {
    console.error('Unexpected error in product update:', error);
    res.status(500).json({ 
      message: 'Unexpected error occurred', 
      error: error.message 
    });
  }
});

// Delete product image
router.delete('/products/:productId/images/:imageIndex', requireVendor, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      vendor: req.user.id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= product.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    // Remove image from filesystem
    const imageUrl = product.images[imageIndex].url;
    const imagePath = path.join(process.cwd(), 'uploads', 'products', path.basename(imageUrl));
    try {
      await fs.promises.unlink(imagePath);
    } catch (error) {
      console.error('Error deleting image file:', error);
      // Continue even if file deletion fails
    }

    // Remove image from product
    product.images.splice(imageIndex, 1);
    await product.save();

    res.json({ message: 'Image deleted successfully', images: product.images });
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({ message: 'Error deleting product image' });
  }
});

// Reorder product images
router.put('/products/:productId/images/reorder', requireVendor, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      vendor: req.user.id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { newOrder } = req.body;
    if (!Array.isArray(newOrder) || newOrder.length !== product.images.length) {
      return res.status(400).json({ message: 'Invalid image order' });
    }

    // Validate indices
    const validIndices = newOrder.every(index => 
      Number.isInteger(index) && index >= 0 && index < product.images.length
    );
    if (!validIndices) {
      return res.status(400).json({ message: 'Invalid image indices' });
    }

    // Reorder images
    const reorderedImages = newOrder.map(index => product.images[index]);
    product.images = reorderedImages;
    await product.save();

    res.json({ message: 'Images reordered successfully', images: product.images });
  } catch (error) {
    console.error('Error reordering product images:', error);
    res.status(500).json({ message: 'Error reordering product images' });
  }
});

// Delete product
router.delete('/products/:productId', requireVendor, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.productId,
      vendor: req.user.id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Fetch products for store display
router.get('/store/products', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 20,
      includeOutOfStock = false // New parameter
    } = req.query;

    // First, let's check what products exist
    const allProducts = await Product.find({}).select('name status stock');
    console.log('All products in database:', allProducts);

    // Build query with less restrictions for testing
    const query = {};
    
    // Only apply status filter if we have published products
    const hasPublishedProducts = allProducts.some(p => p.status === 'published');
    if (hasPublishedProducts) {
      query.status = 'published';
    } else {
      console.log('Warning: No published products found');
    }

    // Only apply stock filter if we have in-stock products
    const hasInStockProducts = allProducts.some(p => p.stock > 0);
    if (hasInStockProducts && !includeOutOfStock) {
      query.stock = { $gt: 0 };
    } else {
      console.log('Warning: No in-stock products found');
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    console.log('Final query:', query);

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'vendor',
        select: 'name email storeDetails.storeName storeDetails.logo'
      }
    };

    const result = await Product.paginate(query, options);
    
    // Log the results
    console.log('Query results:', {
      totalDocs: result.totalDocs,
      productsFound: result.docs.map(p => ({
        name: p.name,
        status: p.status,
        stock: p.stock
      }))
    });

    if (!result.docs || result.docs.length === 0) {
      return res.status(404).json({ 
        message: 'No products found',
        query,
        debug: {
          totalProducts: allProducts.length,
          publishedProducts: allProducts.filter(p => p.status === 'published').length,
          inStockProducts: allProducts.filter(p => p.stock > 0).length
        }
      });
    }

    res.json({
      products: result.docs,
      totalProducts: result.totalDocs,
      totalPages: result.totalPages,
      currentPage: result.page
    });
  } catch (error) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ 
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get vendor dashboard stats
router.get('/dashboard', requireVendor, async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { vendor: req.user._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          publishedProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draftProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] }
          },
          totalRatings: { $sum: { $size: { $ifNull: ['$ratings', []] } } },
          ratingSum: {
            $sum: {
              $reduce: {
                input: { $ifNull: ['$ratings', []] },
                initialValue: 0,
                in: { $add: ['$$value', '$$this.rating'] }
              }
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalProducts: 0,
      publishedProducts: 0,
      draftProducts: 0,
      outOfStockProducts: 0,
      totalRatings: 0,
      ratingSum: 0
    };

    // Calculate average rating
    const averageRating = result.totalRatings > 0
      ? result.ratingSum / result.totalRatings
      : 0;

    // Remove unnecessary fields and add average rating
    delete result._id;
    delete result.totalRatings;
    delete result.ratingSum;
    result.averageRating = averageRating;

    res.json(result);
  } catch (error) {
    console.error('Error fetching vendor dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

export default router;

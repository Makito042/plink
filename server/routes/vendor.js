import express from 'express';
import { auth } from '../middleware/auth.js';
import { processImages } from '../middleware/imageProcessing.js';
import Product from '../models/Product.js';
import multer from 'multer';
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
router.use(requireVendor);

// Create a new product
router.post('/products', async (req, res) => {
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
            tags
          } = req.body;

          // Process uploaded images
          const images = req.files ? req.files.map(file => ({
            url: `/uploads/products/${file.filename}`,
            alt: name,
            metadata: file.metadata // Add image metadata
          })) : [];

          const product = new Product({
            name,
            description,
            price: parseFloat(price),
            images,
            category,
            vendor: req.user.id,
            stock: parseInt(stock),
            specifications: JSON.parse(specifications || '[]'),
            dimensions: JSON.parse(dimensions || '{}'),
            tags: JSON.parse(tags || '[]'),
            status: 'draft'
          });

          await product.save();

          // Include any file processing errors in the response
          const response = {
            product,
            message: 'Product created successfully'
          };
          if (req.fileErrors?.length) {
            response.warnings = {
              message: 'Some images failed to process',
              errors: req.fileErrors
            };
          }

          res.status(201).json(response);
        } catch (error) {
          console.error('Product creation error:', error);
          res.status(500).json({ 
            message: 'Error creating product',
            error: error.message
          });
        }
      });
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      message: 'Error creating product',
      error: error.message 
    });
  }
});

// Bulk upload products
router.post('/products/bulk', async (req, res) => {
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
router.get('/products', async (req, res) => {
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
router.put('/products/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      vendor: req.user.id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

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
          const updates = { ...req.body };
          
          // Process new images if uploaded
          if (req.files?.length) {
            const newImages = req.files.map(file => ({
              url: `/uploads/products/${file.filename}`,
              alt: updates.name || product.name,
              metadata: file.metadata // Add image metadata
            }));
            updates.images = [...product.images, ...newImages];
          }

          // Parse JSON fields
          if (updates.specifications) {
            updates.specifications = JSON.parse(updates.specifications);
          }
          if (updates.dimensions) {
            updates.dimensions = JSON.parse(updates.dimensions);
          }
          if (updates.tags) {
            updates.tags = JSON.parse(updates.tags);
          }
          if (updates.price) {
            updates.price = parseFloat(updates.price);
          }
          if (updates.stock) {
            updates.stock = parseInt(updates.stock);
          }

          Object.assign(product, updates);
          await product.save();

          // Include any file processing errors in the response
          const response = {
            product,
            message: 'Product updated successfully'
          };
          if (req.fileErrors?.length) {
            response.warnings = {
              message: 'Some images failed to process',
              errors: req.fileErrors
            };
          }

          res.json(response);
        } catch (error) {
          console.error('Error updating product:', error);
          res.status(500).json({ 
            message: 'Error updating product',
            error: error.message 
          });
        }
      });
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Error updating product',
      error: error.message 
    });
  }
});

// Delete product image
router.delete('/products/:productId/images/:imageIndex', async (req, res) => {
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
router.put('/products/:productId/images/reorder', async (req, res) => {
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
router.delete('/products/:productId', async (req, res) => {
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

// Get vendor dashboard stats
router.get('/dashboard', auth, requireVendor, async (req, res) => {
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

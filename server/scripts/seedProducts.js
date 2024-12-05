import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Robust MongoDB connection function
async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB with URI:', uri);

    // Remove SRV record resolution
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds
    });

    console.log('Successfully connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error Details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
}

async function seedProducts() {
  try {
    // Ensure database connection
    const isConnected = await connectToDatabase();
    if (!isConnected) {
      console.error('Failed to connect to database. Seeding aborted.');
      process.exit(1);
    }

    // Find a vendor to associate products with
    const vendor = await User.findOne({ role: 'vendor' });
    if (!vendor) {
      console.error('No vendor found. Please create a vendor first.');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Clear existing products
    await Product.deleteMany({});

    // Sample product data
    const sampleProducts = [
      {
        name: 'Vitamin C Supplement',
        description: 'High-potency Vitamin C for immune support',
        price: 15.99,
        category: 'Supplements',
        vendor: vendor._id,
        stock: 100,
        status: 'active',
        images: [{
          url: '/uploads/products/vitamin-c.jpg',
          alt: 'Vitamin C Supplement',
          metadata: {
            width: 500,
            height: 500,
            format: 'jpg',
            size: 50000
          }
        }]
      },
      {
        name: 'Pain Relief Gel',
        description: 'Fast-acting topical pain relief',
        price: 12.50,
        category: 'Medical Devices',
        vendor: vendor._id,
        stock: 50,
        status: 'active',
        images: [{
          url: '/uploads/products/pain-relief-gel.jpg',
          alt: 'Pain Relief Gel',
          metadata: {
            width: 500,
            height: 500,
            format: 'jpg',
            size: 45000
          }
        }]
      },
      {
        name: 'First Aid Kit',
        description: 'Comprehensive first aid kit for home and travel',
        price: 29.99,
        category: 'First Aid',
        vendor: vendor._id,
        stock: 25,
        status: 'active',
        images: [{
          url: '/uploads/products/first-aid-kit.jpg',
          alt: 'First Aid Kit',
          metadata: {
            width: 500,
            height: 500,
            format: 'jpg',
            size: 60000
          }
        }]
      }
    ];

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Seeded ${insertedProducts.length} products`);
  } catch (error) {
    console.error('Error seeding products:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedProducts();

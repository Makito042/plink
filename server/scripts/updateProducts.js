import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    // Update all products to be published and in stock
    const updatePromises = products.map(product => {
      product.status = 'published';
      product.stock = Math.max(product.stock, 10); // Ensure at least 10 items in stock
      return product.save();
    });

    await Promise.all(updatePromises);
    console.log('Updated all products to published status with stock');

    // Verify the updates
    const updatedProducts = await Product.find({});
    console.log('\nUpdated Products:');
    updatedProducts.forEach(product => {
      console.log(`- ${product.name}: status=${product.status}, stock=${product.stock}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updateProducts();

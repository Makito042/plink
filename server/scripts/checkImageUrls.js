import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkImageUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({}).select('name images');
    
    console.log('\nCurrent Product Images:');
    products.forEach(product => {
      console.log(`\nProduct: ${product.name}`);
      console.log('Images:', JSON.stringify(product.images, null, 2));
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkImageUrls();

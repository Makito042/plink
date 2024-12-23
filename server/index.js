import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';
import vendorRoutes from './routes/vendor.js';
import storeRoutes from './routes/store.js';
import SystemLog from './models/SystemLog.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create upload directories if they don't exist
const uploadDirs = ['./uploads', './uploads/products', './uploads/temp'];
uploadDirs.forEach(dir => {
  const fullPath = join(__dirname, dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
});

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// MongoDB Connection with enhanced retry logic and error handling
const connectDB = async (retryCount = 0, maxRetries = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      // Atlas-specific options
      ssl: true,
      retryWrites: true,
      w: 'majority'
    });

    console.log('MongoDB Atlas Connected successfully!');
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Host: ${conn.connection.host}`);

    // Create indexes for SystemLog collection
    try {
      await SystemLog.createIndexes();
      console.log('SystemLog indexes created');
    } catch (indexError) {
      console.warn('Failed to create SystemLog indexes:', indexError);
      // Continue even if index creation fails
    }

    return conn;
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    });
    
    if (retryCount < maxRetries) {
      console.log(`Retrying connection... Attempt ${retryCount + 1} of ${maxRetries}`);
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return connectDB(retryCount + 1, maxRetries);
    }
    
    console.error('Max retry attempts reached. Exiting...');
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/store', storeRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // First try the 'dist' directory
  const distPath = join(__dirname, '../dist');
  const buildPath = join(__dirname, '../build');
  
  // Check if dist exists, if not use build
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(join(distPath, 'index.html'));
    });
  } else {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
      res.sendFile(join(buildPath, 'index.html'));
    });
  }
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB Atlas disconnected! Attempting to reconnect...');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB Atlas connection error:', err);
});

// Connect to MongoDB before starting the server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
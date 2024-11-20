import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import { createServer } from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
}

// Handle client-side routing
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    res.status(404).json({ message: 'API endpoint not found' });
  } else if (process.env.NODE_ENV === 'production') {
    res.sendFile(join(__dirname, '../dist/index.html'));
  } else {
    res.redirect('http://localhost:5173' + req.url);
  }
});

const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = createServer(app);
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying ${port + 1}`);
        resolve(startServer(port + 1));
      } else {
        reject(error);
      }
    });

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      resolve(server);
    });
  });
};

const PORT = process.env.PORT || 5001;

try {
  const server = await startServer(PORT);
  
  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Server closed');
    });
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  adminKey: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  statusReason: z.string().optional()
});

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin_secret_2024';

// Register route
router.post('/register', async (req, res) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if this is an admin registration
    const isAdmin = validatedData.adminKey === ADMIN_SECRET_KEY;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    // Create new user
    const user = new User({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      role: isAdmin ? 'admin' : 'user',
      status: 'active',
      lastLogin: new Date()
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: validatedData.email.toLowerCase() });

    if (!user) {
      console.log('User not found:', validatedData.email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(validatedData.password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is inactive
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    // Send success response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        statusHistory: user.statusHistory,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Update profile route
router.put('/profile', async (req, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle status change (admin only)
    if (validatedData.status && req.user.role === 'admin' && userId !== req.user.id) {
      user.status = validatedData.status;
      if (validatedData.statusReason) {
        user.statusHistory = user.statusHistory || [];
        user.statusHistory.unshift({
          status: validatedData.status,
          reason: validatedData.statusReason,
          timestamp: new Date()
        });
      }
    }

    // Update basic info
    if (validatedData.name) user.name = validatedData.name;
    if (validatedData.email) user.email = validatedData.email.toLowerCase();

    // Handle password change
    if (validatedData.currentPassword && validatedData.newPassword) {
      const isMatch = await user.comparePassword(validatedData.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(validatedData.newPassword, salt);
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      statusHistory: user.statusHistory,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

export default router;
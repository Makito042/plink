import express from 'express';
import { auth, requireAdmin } from '../middleware/auth.js';
import { db } from '../db/inMemoryDb.js';

const router = express.Router();

// Middleware to ensure admin access
router.use(auth);
router.use(requireAdmin);

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const users = Array.from(db.users.values());
    const orders = Array.from(db.orders.values());
    
    const stats = {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.amount, 0),
      activeUsers: users.filter(user => user.status === 'active').length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = Array.from(db.users.values()).map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = Array.from(db.orders.values()).map(order => ({
      id: order.id,
      userEmail: db.users.get(order.userId).email,
      amount: order.amount,
      status: order.status,
      items: order.items
    }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Block/unblock user
router.post('/users/:userId/block', async (req, res) => {
  try {
    const user = db.users.get(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.status = user.status === 'active' ? 'blocked' : 'active';
    db.users.set(user.id, user);
    
    res.json({ message: 'User status updated', status: user.status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Delete order
router.delete('/orders/:orderId', async (req, res) => {
  try {
    const order = db.orders.get(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    db.orders.delete(req.params.orderId);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order' });
  }
});

// Generate admin report
router.get('/report', async (req, res) => {
  try {
    const users = Array.from(db.users.values());
    const orders = Array.from(db.orders.values());
    
    // Generate CSV data
    const csvRows = [];
    csvRows.push(['Report Generated:', new Date().toISOString()]);
    csvRows.push([]);
    
    // User summary
    csvRows.push(['User Summary']);
    csvRows.push(['Total Users:', users.length]);
    csvRows.push(['Active Users:', users.filter(u => u.status === 'active').length]);
    csvRows.push(['Admin Users:', users.filter(u => u.role === 'admin').length]);
    csvRows.push([]);
    
    // Order summary
    csvRows.push(['Order Summary']);
    csvRows.push(['Total Orders:', orders.length]);
    csvRows.push(['Total Revenue:', orders.reduce((sum, o) => sum + o.amount, 0)]);
    csvRows.push([]);
    
    // Detailed order data
    csvRows.push(['Recent Orders']);
    csvRows.push(['Order ID', 'User Email', 'Amount', 'Status', 'Date']);
    orders.forEach(order => {
      csvRows.push([
        order.id,
        db.users.get(order.userId).email,
        order.amount,
        order.status,
        order.createdAt
      ]);
    });
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=admin-report.csv');
    
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Error generating report' });
  }
});

export default router;

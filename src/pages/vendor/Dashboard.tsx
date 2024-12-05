import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchVendorDashboardStats } from '../../services/api';
import { 
  Box, 
  Grid, 
  Card, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Star, 
  PlusCircle,
  Layers,
  Truck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductList from './ProductList';
import AddProductModal from './AddProductModal';
import InventoryManagement from './InventoryManagement';

interface VendorStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  averageRating: number;
}

const defaultStats: VendorStats = {
  totalProducts: 0,
  publishedProducts: 0,
  draftProducts: 0,
  outOfStockProducts: 0,
  averageRating: 0,
};

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<VendorStats>(defaultStats);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchVendorDashboardStats();
      setStats({
        totalProducts: response?.totalProducts ?? 0,
        publishedProducts: response?.publishedProducts ?? 0,
        draftProducts: response?.draftProducts ?? 0,
        outOfStockProducts: response?.outOfStockProducts ?? 0,
        averageRating: response?.averageRating ?? 0,
      });
    } catch (err) {
      setError('Failed to load vendor statistics. Please try again later.');
      console.error('Error fetching vendor stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAddProduct = () => {
    setIsAddProductModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddProductModalOpen(false);
    fetchStats(); // Refresh stats after adding a product
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Vendor Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Package size={48} strokeWidth={1.5} />
              <Typography variant="h5" sx={{ mt: 2 }}>
                {stats.totalProducts}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Total Products
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <ShoppingBag size={48} strokeWidth={1.5} />
              <Typography variant="h5" sx={{ mt: 2 }}>
                {stats.publishedProducts}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Published Products
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Star size={48} strokeWidth={1.5} />
              <Typography variant="h5" sx={{ mt: 2 }}>
                {stats.averageRating.toFixed(1)}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Average Rating
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}
      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h5">Your Products</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlusCircle />}
            onClick={handleAddProduct}
          >
            Add New Product
          </Button>
        </Box>
        <ProductList onProductUpdate={fetchStats} />
      </Paper>
      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h5">Navigation</Typography>
        </Box>
        <List>
          <ListItem button component={Link} to="/vendor/inventory-management">
            <ListItemIcon>
              <Layers size={24} strokeWidth={1.5} />
            </ListItemIcon>
            <ListItemText primary="Inventory Management" />
          </ListItem>
          <ListItem button component={Link} to="/vendor/dashboard">
            <ListItemIcon>
              <Truck size={24} strokeWidth={1.5} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
        </List>
      </Paper>

      <AddProductModal
        open={isAddProductModalOpen}
        onClose={handleCloseModal}
        onProductAdded={() => {
          setIsAddProductModalOpen(false);
          fetchStats();
        }}
      />
    </Container>
  );
};

export default VendorDashboard;

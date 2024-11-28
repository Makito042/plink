import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchVendorDashboardStats } from '../../services/api';
import { Box, Grid, Card, Typography, Button, CircularProgress } from '@mui/material';
import { Package, DollarSign, ShoppingBag, Star } from 'lucide-react';
import ProductList from './ProductList';
import AddProductModal from './AddProductModal';

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
  const [error, setError] = useState<string>('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await fetchVendorDashboardStats();
      setStats({
        totalProducts: data?.totalProducts ?? 0,
        publishedProducts: data?.publishedProducts ?? 0,
        draftProducts: data?.draftProducts ?? 0,
        outOfStockProducts: data?.outOfStockProducts ?? 0,
        averageRating: data?.averageRating ?? 0,
      });
    } catch (err) {
      setError('Failed to load vendor statistics');
      console.error('Error fetching vendor stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Vendor Dashboard</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Welcome back, {user?.storeDetails?.storeName || user?.name || 'Vendor'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsAddProductModalOpen(true)}
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Add New Product
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Package style={{ width: 40, height: 40, color: '#2196f3' }} />
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Products
                </Typography>
                <Typography variant="h4">
                  {stats.totalProducts}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingBag style={{ width: 40, height: 40, color: '#4caf50' }} />
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Published Products
                </Typography>
                <Typography variant="h4">
                  {stats.publishedProducts}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Package style={{ width: 40, height: 40, color: '#ff9800' }} />
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Draft Products
                </Typography>
                <Typography variant="h4">
                  {stats.draftProducts}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Star style={{ width: 40, height: 40, color: '#9c27b0' }} />
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Average Rating
                </Typography>
                <Typography variant="h4">
                  {formatRating(stats.averageRating)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <ProductList onProductAdded={fetchStats} />
      </Box>
      
      <AddProductModal
        open={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={() => {
          fetchStats();
          setIsAddProductModalOpen(false);
        }}
      />
    </Box>
  );
};

export default VendorDashboard;

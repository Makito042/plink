import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchVendorStats, fetchVendorProducts } from '../../services/api';
import { Box, Grid, Card, Typography, Button } from '@mui/material';
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

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await fetchVendorStats();
      setStats(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load vendor statistics');
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.storeDetails?.storeName}</p>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsAddProductModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          Add New Product
        </Button>
      </div>

      <Grid container spacing={4} className="mb-8">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <Typography variant="subtitle2" color="textSecondary">
                  Total Products
                </Typography>
                <Typography variant="h4">
                  {stats?.totalProducts || 0}
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-4">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <Typography variant="subtitle2" color="textSecondary">
                  Published Products
                </Typography>
                <Typography variant="h4">
                  {stats?.publishedProducts || 0}
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <Typography variant="subtitle2" color="textSecondary">
                  Draft Products
                </Typography>
                <Typography variant="h4">
                  {stats?.draftProducts || 0}
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <Typography variant="subtitle2" color="textSecondary">
                  Average Rating
                </Typography>
                <Typography variant="h4">
                  {stats?.averageRating?.toFixed(1) || '0.0'}
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>
      </Grid>

      <ProductList onProductAdded={fetchStats} />
      
      <AddProductModal
        open={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={fetchStats}
      />
    </div>
  );
};

export default VendorDashboard;

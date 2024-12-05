import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  Chip,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Edit, 
  Trash2, 
  PlusCircle, 
  Package, 
  AlertCircle 
} from 'lucide-react';
import { fetchVendorProducts, deleteProduct } from '../../services/api';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import { useAuth } from '../../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  images?: string[];
}

const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProducts = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching vendor products...');
      const response = await fetchVendorProducts(1, 50); // Increase limit to fetch more products
      console.log('Fetched products:', response);
      
      if (!response.products || response.products.length === 0) {
        console.warn('No products found. This might indicate an issue with product fetching.');
      }
      
      setProducts(response.products || []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch products', error);
      // More detailed error handling
      if (error instanceof Error) {
        setError(`Failed to load products: ${error.message}`);
      } else {
        setError('An unknown error occurred while fetching products');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error('Failed to delete product', error);
      setError(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          <Package size={32} style={{ verticalAlign: 'middle', marginRight: 10 }} />
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PlusCircle />}
          onClick={() => setIsAddModalOpen(true)}
          sx={{ 
            padding: '10px 20px',
            fontSize: '1rem',
            textTransform: 'none'
          }}
        >
          Add New Product
        </Button>
      </Box>

      {products.length === 0 && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          textAlign="center"
          sx={{ 
            border: '2px dashed grey', 
            borderRadius: 2, 
            p: 4, 
            mb: 4 
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Your inventory is empty
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Click "Add New Product" to start building your inventory
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PlusCircle />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{ mt: 2 }}
          >
            Add Your First Product
          </Button>
        </Box>
      )}

      {products.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    {product.price.toLocaleString('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.status.replace('_', ' ')} 
                      color={
                        product.status === 'in_stock' ? 'success' : 
                        product.status === 'low_stock' ? 'warning' : 'error'
                      } 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => setEditProduct(product)}
                    >
                      <Edit size={20} />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Products</Typography>
            <Typography variant="h4">{products.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">In Stock</Typography>
            <Typography variant="h4">
              {products.filter(p => p.status === 'in_stock').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Low Stock</Typography>
            <Typography variant="h4" color="warning.main">
              {products.filter(p => p.status === 'low_stock').length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <AddProductModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={fetchProducts}
      />

      {editProduct && (
        <EditProductModal
          open={!!editProduct}
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onProductUpdated={fetchProducts}
        />
      )}
    </Container>
  );
};

export default InventoryManagement;

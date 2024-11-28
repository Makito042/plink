import React, { useEffect, useState } from 'react';
import {
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
  Typography,
  TablePagination
} from '@mui/material';
import { Edit, Trash2 } from 'lucide-react';
import { Product, fetchVendorProducts, deleteProduct } from '../../services/api';
import EditProductModal from './EditProductModal';
import { useAuth } from '../../context/AuthContext';

const ProductList: React.FC<{ onProductAdded?: () => void }> = ({ onProductAdded }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  const loadProducts = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetchVendorProducts(page + 1, rowsPerPage);
      setProducts(response.products || []);
      setTotalProducts(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user?.id, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(productId);
      await loadProducts();
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return '$0.00';
  };

  if (loading) return <Typography>Loading products...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Products</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditProduct({} as Product)}
        >
          Add Product
        </Button>
      </Box>

      {products.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          No products found. Add your first product using the button above.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name || 'Untitled Product'}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.stock || 0}</TableCell>
                  <TableCell>{product.category || 'Uncategorized'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => setEditProduct(product)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalProducts}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      )}

      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={() => {
            loadProducts();
            if (onProductAdded) {
              onProductAdded();
            }
          }}
        />
      )}
    </Box>
  );
};

export default ProductList;

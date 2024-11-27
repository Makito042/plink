import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import { X, Upload } from 'lucide-react';
import { updateProduct } from '../../services/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: Array<{ url: string; alt: string }>;
  specifications: Array<{ name: string; value: string }>;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  tags: string[];
  status: string;
}

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onProductUpdated: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  open,
  onClose,
  product,
  onProductUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    category: product.category,
    stock: product.stock.toString(),
    status: product.status,
    specifications: product.specifications,
    dimensions: {
      length: product.dimensions?.length?.toString() || '',
      width: product.dimensions?.width?.toString() || '',
      height: product.dimensions?.height?.toString() || '',
      weight: product.dimensions?.weight?.toString() || '',
    },
    tags: product.tags,
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(product.images);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      status: product.status,
      specifications: product.specifications,
      dimensions: {
        length: product.dimensions?.length?.toString() || '',
        width: product.dimensions?.width?.toString() || '',
        height: product.dimensions?.height?.toString() || '',
        weight: product.dimensions?.weight?.toString() || '',
      },
      tags: product.tags,
    });
    setExistingImages(product.images);
    setNewImages([]);
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('dimensions.')) {
      const dimension = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimension]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      const remainingSlots = 5 - existingImages.length;
      setNewImages(prev => [...prev, ...fileList].slice(0, remainingSlots));
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'dimensions' || key === 'specifications' || key === 'tags') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      // Append existing images
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      // Append new images
      newImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      await updateProduct(product._id, formDataToSend);
      onProductUpdated();
      onClose();
    } catch (err) {
      setError('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Beauty',
    'Toys',
    'Other'
  ];

  const statuses = [
    'draft',
    'published',
    'outOfStock',
    'discontinued'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Product</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Product Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                required
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price"
                type="number"
                fullWidth
                required
                value={formData.price}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="stock"
                label="Stock"
                type="number"
                fullWidth
                required
                value={formData.stock}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="category"
                label="Category"
                select
                fullWidth
                required
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="status"
                label="Status"
                select
                fullWidth
                required
                value={formData.status}
                onChange={handleInputChange}
              >
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Current Images</p>
                  <div className="mt-2 grid grid-cols-5 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-24 object-cover rounded"
                        />
                        <IconButton
                          size="small"
                          className="absolute top-0 right-0 bg-red-500 text-white"
                          onClick={() => removeExistingImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="h-12 w-12 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">
                    Click to upload new images (max 5 total)
                  </span>
                </label>

                {newImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">New Images</p>
                    <div className="mt-2 grid grid-cols-5 gap-4">
                      {newImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <IconButton
                            size="small"
                            className="absolute top-0 right-0 bg-red-500 text-white"
                            onClick={() => removeNewImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="dimensions.length"
                label="Length (cm)"
                type="number"
                fullWidth
                value={formData.dimensions.length}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="dimensions.width"
                label="Width (cm)"
                type="number"
                fullWidth
                value={formData.dimensions.width}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="dimensions.height"
                label="Height (cm)"
                type="number"
                fullWidth
                value={formData.dimensions.height}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="dimensions.weight"
                label="Weight (kg)"
                type="number"
                fullWidth
                value={formData.dimensions.weight}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>

          {error && (
            <div className="mt-4 text-red-500">{error}</div>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProductModal;

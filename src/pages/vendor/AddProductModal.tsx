import React, { useState } from 'react';
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
} from '@mui/material';
import { X, Upload } from 'lucide-react';
import { createProduct } from '../../services/api';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  open,
  onClose,
  onProductAdded,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    specifications: [] as { name: string; value: string }[],
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    tags: [] as string[],
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setImages(prev => [...prev, ...fileList].slice(0, 5)); // Limit to 5 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

      // Append images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await createProduct(formDataToSend);
      onProductAdded();
      onClose();
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        specifications: [],
        dimensions: {
          length: '',
          width: '',
          height: '',
          weight: '',
        },
        tags: [],
      });
      setImages([]);
    } catch (err) {
      setError('Failed to create product');
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>
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

            <Grid item xs={12}>
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

            <Grid item xs={12}>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
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
                    Click to upload images (max 5)
                  </span>
                </label>

                <div className="mt-4 grid grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <IconButton
                        size="small"
                        className="absolute top-0 right-0 bg-red-500 text-white"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </IconButton>
                    </div>
                  ))}
                </div>
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
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddProductModal;

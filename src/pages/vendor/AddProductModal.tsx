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
  Typography,
  Box,
  Alert,
  InputAdornment
} from '@mui/material';
import { X, Upload, ImagePlus } from 'lucide-react';
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');

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
      
      // Validate image files
      const validImageFiles = fileList.filter(file => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const validSize = file.size <= 5 * 1024 * 1024; // 5MB max
        
        if (!validTypes.includes(file.type)) {
          setError(`Invalid file type for ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
          return false;
        }
        
        if (!validSize) {
          setError(`${file.name} is too large. Maximum file size is 5MB.`);
          return false;
        }
        
        return true;
      });

      // Create image previews
      const previews = validImageFiles.map(file => URL.createObjectURL(file));
      
      // Update state
      setImages(prev => [...prev, ...validImageFiles].slice(0, 5));
      setImagePreviews(prev => [...prev, ...previews].slice(0, 5));
      
      // Clear file input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

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

      console.log('Submitting product:', Object.fromEntries(formDataToSend));

      const createdProduct = await createProduct(formDataToSend);
      console.log('Product created successfully:', createdProduct);
      
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
      setImagePreviews([]);
    } catch (err) {
      console.error('Product creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/json' && !file.type.includes('spreadsheet')) {
        setError('Please upload a JSON or Excel file');
        return;
      }
      setBulkUploadFile(file);
      setError('');
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', bulkUploadFile);

    try {
      const response = await fetch('/api/vendor/products/bulk', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload products');
      }

      const result = await response.json();
      onProductAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload products');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Medications',
    'Supplements',
    'Personal Care',
    'Medical Devices',
    'First Aid',
    'Hygiene',
    'Baby Care',
    'Other'
  ];

  const validateForm = () => {
    const requiredFields = ['name', 'price', 'category', 'stock'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (images.length === 0) {
      setError('Please upload at least one product image');
      return false;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return false;
    }

    if (parseInt(formData.stock) < 0) {
      setError('Stock cannot be negative');
      return false;
    }

    return true;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Add New Product
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <X />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Upload Mode Selection */}
          <Grid item xs={12}>
            <Button
              variant={uploadMode === 'single' ? 'contained' : 'outlined'}
              onClick={() => setUploadMode('single')}
              sx={{ mr: 1 }}
            >
              Single Product
            </Button>
            <Button
              variant={uploadMode === 'bulk' ? 'contained' : 'outlined'}
              onClick={() => setUploadMode('bulk')}
            >
              Bulk Upload
            </Button>
          </Grid>

          {uploadMode === 'bulk' ? (
            <>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                  fullWidth
                >
                  Upload JSON/Excel File
                  <input
                    type="file"
                    hidden
                    accept=".json,.xlsx,.xls,.csv"
                    onChange={handleBulkFileChange}
                  />
                </Button>
                {bulkUploadFile && (
                  <p style={{ marginTop: 8 }}>
                    Selected file: {bulkUploadFile.name}
                  </p>
                )}
              </Grid>
            </>
          ) : (
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
                  fullWidth
                  label="Price (RWF)"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">RWF</InputAdornment>,
                    inputProps: { 
                      min: 0,
                      step: 100 // Suggest increments of 100 RWF
                    }
                  }}
                  helperText="Enter the price in Rwandan Francs (RWF)"
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
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Product Images (Max 5)
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 2, 
                      mb: 2 
                    }}
                  >
                    {imagePreviews.map((preview, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          position: 'relative', 
                          width: 100, 
                          height: 100 
                        }}
                      >
                        <img 
                          src={preview} 
                          alt={`Product preview ${index + 1}`} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }} 
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' }
                          }}
                          onClick={() => removeImage(index)}
                        >
                          <X size={16} />
                        </IconButton>
                      </Box>
                    ))}
                    {images.length < 5 && (
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<ImagePlus />}
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          display: 'flex', 
                          flexDirection: 'column' 
                        }}
                      >
                        Add Image
                        <input
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handleImageChange}
                        />
                      </Button>
                    )}
                  </Box>
                </Box>
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
          )}
        </Grid>

        {error && (
          <div className="mt-4 text-red-500">{error}</div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {uploadMode === 'bulk' ? (
          <Button
            onClick={handleBulkUpload}
            variant="contained"
            disabled={!bulkUploadFile || loading}
          >
            {loading ? 'Uploading...' : 'Upload Products'}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Product'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddProductModal;

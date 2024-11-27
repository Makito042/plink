import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/api';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'vendor';
  storeDetails?: {
    storeName: string;
    description: string;
    address: string;
    phone: string;
  };
}

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    storeDetails: {
      storeName: '',
      description: '',
      address: '',
      phone: '',
    },
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        role: value as 'user' | 'vendor'
      }));
      return;
    }
    
    if (name.startsWith('store.')) {
      const storeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        storeDetails: {
          ...prev.storeDetails!,
          [storeField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate vendor store details
    if (formData.role === 'vendor') {
      if (!formData.storeDetails?.storeName?.trim()) {
        setError('Store name is required');
        setLoading(false);
        return;
      }
      if (!formData.storeDetails?.description?.trim()) {
        setError('Store description is required');
        setLoading(false);
        return;
      }
      if (!formData.storeDetails?.address?.trim()) {
        setError('Store address is required');
        setLoading(false);
        return;
      }
      if (!formData.storeDetails?.phone?.trim()) {
        setError('Store phone is required');
        setLoading(false);
        return;
      }
    }

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        storeDetails: formData.role === 'vendor' ? {
          storeName: formData.storeDetails!.storeName.trim(),
          description: formData.storeDetails!.description.trim(),
          address: formData.storeDetails!.address.trim(),
          phone: formData.storeDetails!.phone.trim()
        } : undefined
      };

      console.log('Sending registration data:', { ...registrationData, password: '[REDACTED]' });
      await register(registrationData);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create an Account
          </Typography>

          {error && (
            <Collapse in={!!error}>
              <Alert
                severity="error"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setError('')}
                  >
                    <X />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            </Collapse>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleInputChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />

            <FormControl component="fieldset" sx={{ mt: 2, mb: 2 }}>
              <FormLabel component="legend">Account Type</FormLabel>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              >
                <FormControlLabel value="user" control={<Radio />} label="Customer" />
                <FormControlLabel value="vendor" control={<Radio />} label="Vendor" />
              </RadioGroup>
            </FormControl>

            {formData.role === 'vendor' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Store Details
                </Typography>
                <TextField
                  fullWidth
                  label="Store Name"
                  name="store.storeName"
                  value={formData.storeDetails?.storeName || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Store Description"
                  name="store.description"
                  value={formData.storeDetails?.description || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Store Address"
                  name="store.address"
                  value={formData.storeDetails?.address || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Store Phone"
                  name="store.phone"
                  value={formData.storeDetails?.phone || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
            >
              Already have an account? Sign in
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;

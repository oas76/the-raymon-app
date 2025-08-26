import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        golfHandicap: parseFloat(data.golfHandicap)
      });
      
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join our golf community! Create your account to get started.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              }
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            fullWidth
            label="Golf Handicap"
            type="number"
            margin="normal"
            inputProps={{ 
              min: -10.0, 
              max: 36.0, 
              step: 0.1 
            }}
            {...register('golfHandicap', {
              required: 'Golf handicap is required',
              min: {
                value: -10.0,
                message: 'Golf handicap must be at least -10.0'
              },
              max: {
                value: 36.0,
                message: 'Golf handicap must be at most 36.0'
              },
              validate: {
                isNumber: (value) => {
                  const num = parseFloat(value);
                  return !isNaN(num) || 'Please enter a valid number';
                },
                oneDecimal: (value) => {
                  const num = parseFloat(value);
                  const decimalPlaces = (num.toString().split('.')[1] || '').length;
                  return decimalPlaces <= 1 || 'Maximum 1 decimal place allowed';
                }
              }
            })}
            error={!!errors.golfHandicap}
            helperText={
              errors.golfHandicap?.message || 
              'Enter your golf handicap (-10.0 to 36.0)'
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button color="primary" sx={{ textTransform: 'none' }}>
                Sign in here
              </Button>
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Box, 
  CircularProgress, 
  Typography, 
  Alert 
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const token = searchParams.get('token');
        const profileComplete = searchParams.get('profileComplete') === 'true';

        if (!token) {
          setError('No authentication token received');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Store the token
        localStorage.setItem('authToken', token);

        // Set axios header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Redirect based on profile completion status
        if (profileComplete) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/profile', { replace: true });
        }
      } catch (err) {
        console.error('Auth success handling error:', err);
        setError('Failed to complete authentication');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthSuccess();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" textAlign="center">
          Redirecting to login page...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        textAlign="center"
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          Completing Authentication
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we set up your account...
        </Typography>
      </Box>
    </Container>
  );
};

export default AuthSuccess;

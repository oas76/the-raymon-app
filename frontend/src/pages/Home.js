import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure Authentication',
      description: 'Sign in with Google, Facebook, or Vipps for a secure and convenient experience.'
    },
    {
      icon: <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Profile Management',
      description: 'Manage your golf profile including your name, handicap, and profile picture.'
    },
    {
      icon: <GolfCourseIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Golf Handicap Tracking',
      description: 'Keep track of your golf handicap ranging from -10.0 to 36.0 with precision.'
    },
    {
      icon: <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Image Upload',
      description: 'Upload and manage your profile picture to personalize your golf profile.'
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          borderRadius: 2,
          color: 'white',
          mb: 6
        }}
      >
        <GolfCourseIcon sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          The Raymon App
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ opacity: 0.9 }}>
          Secure authentication and profile management for golfers
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
          Register and manage your golf profile with secure OAuth authentication through Google, 
          Facebook, or Vipps. Track your handicap and maintain your golf identity online.
        </Typography>
        
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={Link}
              to="/dashboard"
              sx={{ 
                px: 4, 
                py: 1.5,
                fontWeight: 'bold',
                boxShadow: 3
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/profile"
              sx={{ 
                px: 4, 
                py: 1.5,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              View Profile
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={Link}
              to="/register"
              sx={{ 
                px: 4, 
                py: 1.5,
                fontWeight: 'bold',
                boxShadow: 3
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/login"
              sx={{ 
                px: 4, 
                py: 1.5,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Sign In
            </Button>
          </Box>
        )}
      </Box>

      {/* Welcome back section for authenticated users */}
      {isAuthenticated && user && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 6, 
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e8f5e8 100%)',
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="h4" gutterBottom color="primary.main">
            Welcome back, {user.name}!
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Golf Handicap:</strong> {user.golfHandicap}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Authentication Provider:</strong> {user.provider}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Profile Status:</strong> {user.isProfileComplete ? '✅ Complete' : '⚠️ Incomplete'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
              {!user.isProfileComplete && (
                <Button
                  variant="contained"
                  color="warning"
                  component={Link}
                  to="/profile"
                  sx={{ mt: 2 }}
                >
                  Complete Your Profile
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Features Section */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
          Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Join thousands of golfers managing their profiles securely.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            to="/register"
            sx={{ px: 4, py: 1.5 }}
          >
            Create Your Account
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Home;

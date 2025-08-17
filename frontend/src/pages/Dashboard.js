import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Paper,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';

const Dashboard = () => {
  const { user } = useAuth();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a local path, prepend the backend URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    return `${baseUrl.replace('/api', '')}${imagePath}?t=${timestamp}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getHandicapCategory = (handicap) => {
    if (handicap < 0) return { label: 'Scratch+', color: 'success' };
    if (handicap <= 5) return { label: 'Low', color: 'info' };
    if (handicap <= 15) return { label: 'Mid', color: 'warning' };
    if (handicap <= 25) return { label: 'High', color: 'secondary' };
    return { label: 'Beginner', color: 'default' };
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const handicapCategory = getHandicapCategory(user.golfHandicap);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user.name}! Here's your golf profile overview.
        </Typography>
      </Box>

      {/* Profile Completion Warning */}
      {!user.isProfileComplete && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: 'warning.light',
            border: '1px solid',
            borderColor: 'warning.main'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WarningIcon color="warning" />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                Complete Your Profile
              </Typography>
              <Typography variant="body2">
                Your profile is incomplete. Please update your information to get the full experience.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="warning"
              component={Link}
              to="/profile"
              startIcon={<EditIcon />}
            >
              Complete Profile
            </Button>
          </Box>
        </Paper>
      )}

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Avatar
                src={user.image ? getImageUrl(user.image) : undefined}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem'
                }}
              >
                {!user.image && <PersonIcon fontSize="large" />}
              </Avatar>
              
              <Typography variant="h4" gutterBottom>
                {user.name}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                <Chip
                  label={user.isProfileComplete ? 'Complete' : 'Incomplete'}
                  color={user.isProfileComplete ? 'success' : 'warning'}
                  size="small"
                />
                <Chip
                  label={user.provider}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
              
              <Button
                variant="outlined"
                component={Link}
                to="/profile"
                startIcon={<EditIcon />}
                fullWidth
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Golf Stats Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <GolfCourseIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">Golf Profile</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Handicap
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {user.golfHandicap}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Chip
                    label={handicapCategory.label}
                    color={handicapCategory.color}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Handicap Range: -10.0 to 36.0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lower numbers indicate better players
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Info Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">Account Information</Typography>
              </Box>
              
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Member Since
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {formatDate(user.createdAt)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Last Login
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {formatDate(user.lastLogin)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Authentication
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Email Verified
                  </Typography>
                  <Chip
                    label={user.isEmailVerified ? 'Verified' : 'Unverified'}
                    color={user.isEmailVerified ? 'success' : 'warning'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                component={Link}
                to="/profile"
                startIcon={<EditIcon />}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                color="primary"
                disabled
              >
                View Statistics (Coming Soon)
              </Button>
              <Button
                variant="outlined"
                color="primary"
                disabled
              >
                Golf Rounds (Coming Soon)
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';

const Profile = () => {
  const { user, updateProfile, uploadProfileImage, deleteProfileImage, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);
  const [imageRefresh, setImageRefresh] = useState(0);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      golfHandicap: user?.golfHandicap || 0
    }
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    // Add timestamp and refresh counter to prevent caching issues and ensure immediate refresh
    const timestamp = new Date().getTime();
    return `${baseUrl.replace('/api', '')}${imagePath}?t=${timestamp}&r=${imageRefresh}`;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await updateProfile({
        name: data.name,
        golfHandicap: parseFloat(data.golfHandicap)
      });

      if (result.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        setMessage({ text: result.message || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select an image file', type: 'error' });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Image must be smaller than 5MB', type: 'error' });
      return;
    }

    setImageLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await uploadProfileImage(file);
      
      if (result.success) {
        setMessage({ text: 'Profile image updated successfully!', type: 'success' });
        // Force image refresh by incrementing counter
        setImageRefresh(prev => prev + 1);
      } else {
        setMessage({ text: result.message || 'Failed to upload image', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' });
    } finally {
      setImageLoading(false);
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async () => {
    setImageLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await deleteProfileImage();
      
      if (result.success) {
        setMessage({ text: 'Profile image deleted successfully!', type: 'success' });
        setDeleteImageDialogOpen(false);
        // Force image refresh by incrementing counter
        setImageRefresh(prev => prev + 1);
      } else {
        setMessage({ text: result.message || 'Failed to delete image', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' });
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccount();
      
      if (result.success) {
        // User will be automatically logged out and redirected
      } else {
        setMessage({ text: result.message || 'Failed to delete account', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Profile Management
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Update your profile information and manage your account settings.
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Profile Image Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Profile Picture
              </Typography>
              
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  src={user.image ? getImageUrl(user.image) : undefined}
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    mx: 'auto',
                    bgcolor: 'primary.main',
                    fontSize: '4rem'
                  }}
                >
                  {!user.image && <PersonIcon fontSize="large" />}
                </Avatar>
                
                {imageLoading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading}
                >
                  Upload Photo
                </Button>
                
                {user.image && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteImageDialogOpen(true)}
                    disabled={imageLoading}
                  >
                    Remove Photo
                  </Button>
                )}
              </Box>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
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
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user.email}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Golf Handicap"
                      type="number"
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
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Authentication Provider"
                      value={user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                      disabled
                      helperText="Your authentication method"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                      size="large"
                      sx={{ mr: 2 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => reset()}
                      disabled={loading}
                      size="large"
                    >
                      Reset
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="error">
              Danger Zone
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Once you delete your account, there is no going back. Please be certain.
            </Typography>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Delete Account
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
            All your data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Image Dialog */}
      <Dialog open={deleteImageDialogOpen} onClose={() => setDeleteImageDialogOpen(false)}>
        <DialogTitle>Remove Profile Picture</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove your profile picture?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteImageDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteImage} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;

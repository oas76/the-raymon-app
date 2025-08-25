import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Pagination
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import PersonIcon from '@mui/icons-material/Person';
import CreateRoundDialog from '../components/CreateRoundDialog';
import axios from 'axios';

const Rounds = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    gameFormat: 'all',
    myRounds: false,
    page: 1
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  const fetchRounds = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.gameFormat !== 'all') params.append('gameFormat', filters.gameFormat);
      if (filters.myRounds) params.append('myRounds', 'true');
      params.append('page', filters.page.toString());
      params.append('limit', '12');
      
      const response = await axios.get(`/rounds?${params.toString()}`);
      
      if (response.data.success) {
        setRounds(response.data.rounds);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch rounds');
      }
    } catch (err) {
      console.error('Fetch rounds error:', err);
      setError('Failed to fetch rounds');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRounds();
    }
  }, [isAuthenticated, filters, fetchRounds]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (event, newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'full': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getGameFormatDisplay = (format) => {
    return format.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const canJoinRound = (round) => {
    return round.status === 'open' && 
           !round.teams.some(team => 
             team.players.some(player => 
               !player.isGuest && player.user && player.user.id === user?.id
             )
           );
  };

  const isOrganizer = (round) => {
    return round.organizer && round.organizer.id === user?.id;
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    fetchRounds(); // Refresh the list
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Play Rounds
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please log in to view and create golf rounds.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/login"
          size="large"
        >
          Log In
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1">
          Golf Rounds
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          size="large"
        >
          Create Round
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 4, p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="full">Full</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Game Format</InputLabel>
              <Select
                value={filters.gameFormat}
                label="Game Format"
                onChange={(e) => handleFilterChange('gameFormat', e.target.value)}
              >
                <MenuItem value="all">All Formats</MenuItem>
                <MenuItem value="stroke-play">Stroke Play</MenuItem>
                <MenuItem value="match-play">Match Play</MenuItem>
                <MenuItem value="scramble">Scramble</MenuItem>
                <MenuItem value="best-ball">Best Ball</MenuItem>
                <MenuItem value="stableford">Stableford</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant={filters.myRounds ? "contained" : "outlined"}
              onClick={() => handleFilterChange('myRounds', !filters.myRounds)}
              fullWidth
            >
              My Rounds Only
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              onClick={() => setFilters({
                status: 'all',
                gameFormat: 'all',
                myRounds: false,
                page: 1
              })}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Rounds Grid */}
      {!loading && (
        <>
          {rounds.length === 0 ? (
            <Box textAlign="center" py={8}>
              <GolfCourseIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No rounds found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {filters.myRounds || filters.status !== 'all' || filters.gameFormat !== 'all'
                  ? 'Try adjusting your filters to see more rounds.'
                  : 'Be the first to create a golf round!'
                }
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Round
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {rounds.map((round) => (
                <Grid item xs={12} sm={6} md={4} key={round.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Status and Organizer Badge */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip 
                          label={round.status.replace('-', ' ').toUpperCase()} 
                          color={getStatusColor(round.status)}
                          size="small"
                        />
                        {isOrganizer(round) && (
                          <Chip 
                            label="Organizer" 
                            color="primary" 
                            size="small"
                            icon={<PersonIcon />}
                          />
                        )}
                      </Box>

                      {/* Round Name */}
                      <Typography variant="h6" gutterBottom noWrap>
                        {round.name}
                      </Typography>

                      {/* Golf Course */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {round.golfCourse?.name || round.customCourse?.name || 'Course TBD'}
                        </Typography>
                      </Box>

                      {/* Date and Time */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(round.scheduledDate)} at {formatTime(round.scheduledTime)}
                        </Typography>
                      </Box>

                      {/* Teams Count */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <GroupIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {round.teams.length}/{round.settings.maxTeams} teams
                        </Typography>
                      </Box>

                      {/* Game Format */}
                      <Chip 
                        label={getGameFormatDisplay(round.gameFormat)} 
                        variant="outlined" 
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        component={Link}
                        to={`/rounds/${round.id}`}
                        fullWidth
                        variant="outlined"
                      >
                        View Details
                      </Button>
                      {canJoinRound(round) && (
                        <Button 
                          size="small" 
                          component={Link}
                          to={`/rounds/${round.id}/join`}
                          variant="contained"
                          color="success"
                        >
                          Join
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Create Round Dialog */}
      <CreateRoundDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
};

export default Rounds;

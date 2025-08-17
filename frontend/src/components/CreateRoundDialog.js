import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const gameFormats = [
  { value: 'stroke-play', label: 'Stroke Play', description: 'Individual scores count, lowest total wins' },
  { value: 'match-play', label: 'Match Play', description: 'Head-to-head competition by holes' },
  { value: 'scramble', label: 'Scramble', description: 'Team plays best shot each time' },
  { value: 'best-ball', label: 'Best Ball', description: 'Team uses lowest score per hole' },
  { value: 'alternate-shot', label: 'Alternate Shot', description: 'Team members alternate shots' },
  { value: 'stableford', label: 'Stableford', description: 'Points-based scoring system' },
  { value: 'skins', label: 'Skins', description: 'Winner takes all per hole' },
  { value: 'nassau', label: 'Nassau', description: 'Three separate matches: front, back, overall' },
  { value: 'wolf', label: 'Wolf', description: 'Rotating teams with point system' },
  { value: 'bingo-bango-bongo', label: 'Bingo Bango Bongo', description: 'Three points per hole system' }
];

const steps = ['Basic Info', 'Golf Course', 'Settings'];

const CreateRoundDialog = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [golfCourses, setGolfCourses] = useState([]);
  const [searchingCourses, setSearchingCourses] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [useCustomCourse, setUseCustomCourse] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      scheduledTime: '09:00',
      gameFormat: 'stroke-play',
      golfCourse: null,
      customCourse: {
        name: '',
        location: '',
        holes: 18,
        par: 72
      },
      settings: {
        holesCount: 18,
        maxTeams: 8,
        allowGuests: true,
        isPrivate: false,
        requireInvitation: false
      }
    }
  });

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setError('');
      setUseCustomCourse(false);
      reset();
    }
  }, [open, reset]);

  const searchGolfCourses = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setGolfCourses([]);
      return;
    }

    try {
      setSearchingCourses(true);
      const response = await axios.get(`/golf-courses/search?location=${encodeURIComponent(searchTerm)}&limit=10`);
      
      if (response.data.success) {
        setGolfCourses(response.data.courses);
      }
    } catch (error) {
      console.error('Course search error:', error);
    } finally {
      setSearchingCourses(false);
    }
  };

  const handleLocationSearchChange = (event, newValue) => {
    setLocationSearch(newValue);
    if (newValue) {
      searchGolfCourses(newValue);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      // Prepare the data
      const roundData = {
        name: data.name,
        description: data.description,
        scheduledDate: data.scheduledDate.toISOString(),
        scheduledTime: data.scheduledTime,
        gameFormat: data.gameFormat,
        settings: data.settings
      };

      // Add golf course or custom course data
      if (useCustomCourse) {
        roundData.customCourse = data.customCourse;
      } else {
        if (!data.golfCourse) {
          setError('Please select a golf course or use custom course option');
          return;
        }
        roundData.golfCourse = data.golfCourse.id;
      }

      const response = await axios.post('/rounds', roundData);

      if (response.data.success) {
        onSuccess();
        reset();
      } else {
        setError(response.data.message || 'Failed to create round');
      }
    } catch (error) {
      console.error('Create round error:', error);
      setError(error.response?.data?.message || 'Failed to create round');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Round name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Round Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="e.g., Weekend Golf with Friends"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Description (Optional)"
                    placeholder="Add details about your round..."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="scheduledDate"
                control={control}
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      {...field}
                      label="Date"
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          error: !!errors.scheduledDate,
                          helperText: errors.scheduledDate?.message
                        } 
                      }}
                      minDate={new Date()}
                    />
                  </LocalizationProvider>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="scheduledTime"
                control={control}
                rules={{ required: 'Time is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="time"
                    label="Tee Time"
                    error={!!errors.scheduledTime}
                    helperText={errors.scheduledTime?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="gameFormat"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Game Format</InputLabel>
                    <Select {...field} label="Game Format">
                      {gameFormats.map((format) => (
                        <MenuItem key={format.value} value={format.value}>
                          <Box>
                            <Typography variant="body1">{format.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6">Golf Course Selection</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useCustomCourse}
                      onChange={(e) => setUseCustomCourse(e.target.checked)}
                    />
                  }
                  label="Use Custom Course"
                />
              </Box>
            </Grid>

            {!useCustomCourse ? (
              <>
                <Grid item xs={12}>
                  <Autocomplete
                    options={golfCourses}
                    getOptionLabel={(option) => `${option.name} - ${option.address.city}, ${option.address.country}`}
                    loading={searchingCourses}
                    onInputChange={handleLocationSearchChange}
                    onChange={(event, newValue) => setValue('golfCourse', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Golf Courses"
                        placeholder="Enter city, course name, or location..."
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          endAdornment: (
                            <>
                              {searchingCourses ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <LocationOnIcon sx={{ mr: 2, color: 'text.secondary' }} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1">{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.address.city}, {option.address.country}
                              {option.distance && ` • ${option.distance} km away`}
                            </Typography>
                            {option.courseInfo && (
                              <Box sx={{ mt: 0.5 }}>
                                <Chip size="small" label={`${option.courseInfo.holes} holes`} sx={{ mr: 1 }} />
                                <Chip size="small" label={`Par ${option.courseInfo.par}`} />
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </li>
                    )}
                    noOptionsText={
                      locationSearch.length < 2 
                        ? "Type to search for golf courses..." 
                        : "No courses found. Try a different location or use custom course."
                    }
                  />
                </Grid>

                {golfCourses.length === 0 && locationSearch.length >= 2 && !searchingCourses && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Can't find your course? Use the "Custom Course" option above to add course details manually.
                    </Alert>
                  </Grid>
                )}
              </>
            ) : (
              <>
                <Grid item xs={12}>
                  <Controller
                    name="customCourse.name"
                    control={control}
                    rules={{ required: useCustomCourse ? 'Course name is required' : false }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Course Name"
                        error={!!errors.customCourse?.name}
                        helperText={errors.customCourse?.name?.message}
                        placeholder="e.g., Pine Valley Golf Club"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="customCourse.location"
                    control={control}
                    rules={{ required: useCustomCourse ? 'Course location is required' : false }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Course Location"
                        error={!!errors.customCourse?.location}
                        helperText={errors.customCourse?.location?.message}
                        placeholder="e.g., Pine Valley, NJ"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Controller
                    name="customCourse.holes"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Holes</InputLabel>
                        <Select {...field} label="Holes">
                          <MenuItem value={9}>9 Holes</MenuItem>
                          <MenuItem value={18}>18 Holes</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Controller
                    name="customCourse.par"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Par"
                        inputProps={{ min: 27, max: 144 }}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Round Settings</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="settings.holesCount"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Holes to Play</InputLabel>
                    <Select {...field} label="Holes to Play">
                      <MenuItem value={9}>9 Holes</MenuItem>
                      <MenuItem value={18}>18 Holes</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="settings.maxTeams"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Maximum Teams"
                    inputProps={{ min: 1, max: 20 }}
                    helperText="1-4 players per team"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>Privacy & Participation</Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="settings.allowGuests"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Allow Guest Players"
                    sx={{ display: 'block' }}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary">
                Teams can include players who don't have accounts
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="settings.isPrivate"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Private Round"
                    sx={{ display: 'block' }}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary">
                Only you can see this round in the public list
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="settings.requireInvitation"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Require Invitation"
                    sx={{ display: 'block' }}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary">
                Players need your approval to join
              </Typography>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5">Create New Golf Round</Typography>
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={loading}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {loading ? 'Creating...' : 'Create Round'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateRoundDialog;

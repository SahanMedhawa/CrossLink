import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Grid, Avatar,
  Chip, Box, Alert, CircularProgress, Divider, Fade, InputAdornment
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Language as WebIcon, 
  PhotoCamera as PhotoIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../utils/imageUrl';

const NGOProfile = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    organizationName: '', registrationNumber: '', phone: '',
    location: '', website: '', bio: '', focusAreas: [], photoURL: '',
  });
  const [newFocusArea, setNewFocusArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Professional SaaS Palette
  const headerBlue = '#1E40AF'; // Deep Royal Blue
  const electricBlue = '#3B82F6'; // Interaction Blue
  const backgroundGray = '#F8FAFC';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('crosslink_token');
      if (!token) return navigate('/login');

      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data.data;
      setUser(userData);
      setFormData({
        organizationName: userData.organizationName || '',
        registrationNumber: userData.registrationNumber || '',
        phone: userData.phone || '',
        location: userData.location || '',
        website: userData.website || '',
        bio: userData.bio || '',
        focusAreas: userData.focusAreas || [],
        photoURL: userData.photoURL || '',
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('crosslink_token');
        navigate('/login');
      } else {
        setError('Failed to fetch profile.');
      }
    } finally {
      setTimeout(() => setFetchLoading(false), 300);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('crosslink_token');
      const response = await axios.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.data);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Update failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFocusArea = () => {
    if (newFocusArea.trim() && !formData.focusAreas.includes(newFocusArea.trim())) {
      setFormData({ ...formData, focusAreas: [...formData.focusAreas, newFocusArea.trim()] });
      setNewFocusArea('');
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: backgroundGray }}>
        <CircularProgress thickness={5} size={45} sx={{ color: headerBlue }} />
      </Box>
    );
  }

  return (
    <DashboardLayout userType="ngo">
      <Fade in={!fetchLoading} timeout={500}>
        <Box sx={{ bgcolor: backgroundGray, minHeight: '100vh', py: 6 }}>
          <Container maxWidth="md">
            
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: '12px', 
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Header - The Requested Blue Section */}
              <Box sx={{ p: 4, bgcolor: headerBlue, color: 'white', position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    src={formData.photoURL ? resolveImageUrl(formData.photoURL) : ''}
                    sx={{ 
                      width: 90, height: 90, 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      fontSize: '2rem',
                      fontWeight: 800,
                      border: '3px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    {formData.organizationName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px', mb: 0.5 }}>
                      NGO Settings
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.9 }}>
                      <ShieldIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formData.organizationName || 'Organization Account'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Form Body */}
              <Box component="form" onSubmit={handleSubmit} sx={{ p: 4, bgcolor: 'white' }}>
                {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '8px' }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>{error}</Alert>}

                <Grid container spacing={3}>
                  
                  {/* Section: Basic Info */}
                  <Grid item xs={12}>
                    <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 700, mb: 2, display: 'block' }}>
                      Verification & Identity
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth label="Organization Name"
                          value={formData.organizationName}
                          onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth label="Registration ID"
                          value={formData.registrationNumber}
                          onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth label="Logo Image URL"
                          placeholder="https://..."
                          value={formData.photoURL}
                          onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><PhotoIcon sx={{ fontSize: 20 }} /></InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                  {/* Section: Public Profile */}
                  <Grid item xs={12}>
                    <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 700, mb: 2, display: 'block' }}>
                      About & Contact
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth multiline rows={4} label="Organization Bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          placeholder="Briefly describe your mission..."
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth label="Official Website"
                          value={formData.website}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><WebIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth label="Headquarters Location"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><LocationIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Section: Focus Areas */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Impact Areas</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        size="small" fullWidth
                        placeholder="e.g. Environmentalism"
                        value={newFocusArea}
                        onChange={(e) => setNewFocusArea(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFocusArea())}
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleAddFocusArea}
                        sx={{ bgcolor: headerBlue, minWidth: '45px', p: 0 }}
                      >
                        <AddIcon />
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.focusAreas.map((area, index) => (
                        <Chip
                          key={index} label={area}
                          onDelete={() => setFormData({...formData, focusAreas: formData.focusAreas.filter(a => a !== area)})}
                          sx={{ 
                            borderRadius: '8px', 
                            fontWeight: 600, 
                            bgcolor: '#F1F5F9', 
                            color: headerBlue,
                            '&:hover': { bgcolor: '#E2E8F0' }
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>

                  {/* Footer Actions */}
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, pt: 3, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button 
                        onClick={() => { localStorage.removeItem('crosslink_token'); navigate('/login'); }}
                        startIcon={<LogoutIcon />}
                        sx={{ color: '#94A3B8', textTransform: 'none', fontWeight: 600 }}
                      >
                        Sign out
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                          bgcolor: headerBlue,
                          color: 'white',
                          px: 6, py: 1.5,
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '1rem',
                          '&:hover': { bgcolor: '#173693', boxShadow: '0 8px 20px rgba(30, 64, 175, 0.3)' }
                        }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Profile Changes'}
                      </Button>
                    </Box>
                  </Grid>

                </Grid>
              </Box>
            </Paper>
          </Container>
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default NGOProfile;
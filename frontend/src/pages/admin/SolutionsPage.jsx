import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Container, Typography, Paper, Table, 
  TableBody, TableCell, TableContainer, TableHead, 
  TableRow, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Grid,
  CircularProgress, Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
//import solutionService from '../../services/solutionService';
import { solutionsService } from "@/lib/api-service";

const SolutionsPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSolution, setCurrentSolution] = useState({
    title: '',
    slug: '',
    description: '',
    features: [],
    //benefits: [],
    //target_markets: [],
    is_active: true
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await solutionsService.getAllSolutions();
      console.log('Fetched solutions:', data);
      setSolutions(data);
    } catch (error) {
      console.error('Failed to fetch solutions:', error);
      setError('Failed to load solutions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (solution = null) => {
    if (solution) {
      // Make a deep copy to avoid direct state mutation
      const solutionCopy = { ...solution };
      
      // Ensure arrays are properly initialized
      solutionCopy.features = solutionCopy.features || [];
      solutionCopy.benefits = solutionCopy.benefits || [];
      solutionCopy.target_markets = solutionCopy.target_markets || [];
      
      setCurrentSolution(solutionCopy);
      setIsEditing(true);
    } else {
      setCurrentSolution({
        title: '',
        slug: '',
        description: '',
        features: [],
       // benefits: [],
       // target_markets: [],
        is_active: true
      });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSolution({ ...currentSolution, [name]: value });
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value;
    // Convert comma-separated string to array
    const arrayValue = value ? value.split(',').map(item => item.trim()) : [];
    setCurrentSolution({ ...currentSolution, [field]: arrayValue });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Submitting solution data:', currentSolution);
      
      if (isEditing) {
        await solutionsService.updateSolution(currentSolution.id, currentSolution);
      } else {
        await solutionsService.createSolution(currentSolution);
      }
      fetchSolutions();
      handleClose();
    } catch (error) {
      console.error('Error saving solution:', error);
      setError('Failed to save solution. Please check your data and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this solution?')) {
      setLoading(true);
      try {
        await solutionsService.deleteSolution(id);
        fetchSolutions();
      } catch (error) {
        console.error('Error deleting solution:', error);
        setError('Failed to delete solution. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Solutions Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />} 
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
          disabled={loading}
        >
          Add New Solution
        </Button>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {solutions.length > 0 ? (
                  solutions.map((solution) => (
                    <TableRow key={solution.id}>
                      <TableCell>{solution.title}</TableCell>
                      <TableCell>{solution.slug}</TableCell>
                      <TableCell>
                        {solution.description && solution.description.substring(0, 100)}
                        {solution.description && solution.description.length > 100 ? '...' : ''}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpen(solution)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(solution.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No solutions found. Add your first solution!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Solution' : 'Add New Solution'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={currentSolution.title || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Slug"
                name="slug"
                value={currentSolution.slug || ''}
                onChange={handleChange}
                helperText="URL-friendly name (e.g., 'network-security')"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={currentSolution.description || ''}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Features (comma-separated)"
                name="features"
                value={Array.isArray(currentSolution.features) ? currentSolution.features.join(', ') : ''}
                onChange={(e) => handleArrayChange(e, 'features')}
                multiline
                rows={2}
              />
            </Grid>
            {/* <Grid item xs={12}>
              <TextField
                fullWidth
                label="Benefits (comma-separated)"
                name="benefits"
                value={Array.isArray(currentSolution.benefits) ? currentSolution.benefits.join(', ') : ''}
                onChange={(e) => handleArrayChange(e, 'benefits')}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Target Markets (comma-separated)"
                name="target_markets"
                value={Array.isArray(currentSolution.target_markets) ? currentSolution.target_markets.join(', ') : ''}
                onChange={(e) => handleArrayChange(e, 'target_markets')}
                multiline
                rows={2}
              />
            </Grid> */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SolutionsPage;
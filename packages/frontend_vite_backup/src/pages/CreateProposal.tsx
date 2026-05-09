import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  InputAdornment,
} from '@mui/material';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createProposal } from '../services/proposals';
import { glassCardStyle, gradientBackground } from '../theme';

export default function CreateProposal() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (title.length < 10) {
      setError('Title must be at least 10 characters');
      return;
    }
    if (description.length < 50) {
      setError('Description must be at least 50 characters');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const { id } = await createProposal({ title, description });
      navigate(`/proposals/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={gradientBackground}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Button component={Link} to="/proposals" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
          Back to Proposals
        </Button>

        <Card sx={{ ...glassCardStyle, p: 2 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'primary.dark', mb: 1 }}>
                Create Proposal
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Share your idea with the community
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Proposal Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="A clear, descriptive title for your proposal"
                sx={{ mb: 3 }}
                inputProps={{ minLength: 10 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe your proposal in detail. Explain the problem, your proposed solution, and the expected impact."
                multiline
                rows={8}
                sx={{ mb: 4 }}
                inputProps={{ minLength: 50 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/proposals"
                  sx={{ px: 4 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  endIcon={<SendIcon />}
                  sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
                >
                  {loading ? 'Submitting...' : 'Submit Proposal'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        <Card sx={{ mt: 4, p: 3, bgcolor: 'info.light', ...glassCardStyle }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Tips for a Great Proposal
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 1.5 }}>
            <li><Typography variant="body2">Be specific and concrete in your description</Typography></li>
            <li><Typography variant="body2">Explain the problem you're trying to solve</Typography></li>
            <li><Typography variant="body2">Describe the expected outcomes and benefits</Typography></li>
            <li><Typography variant="body2">Keep it focused - one proposal per topic</Typography></li>
          </ul>
        </Card>
      </Container>
    </Box>
  );
}
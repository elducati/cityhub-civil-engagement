import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Skeleton,
  Fade,
} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { listProposals } from '../services/proposals';
import type { Proposal } from '../types';
import { glassCardStyle, gradientBackground } from '../theme';

export default function Home() {
  const [featuredProposals, setFeaturedProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProposals({ limit: 6, sort: 'voteCount' })
      .then((res) => setFeaturedProposals(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'success';
      case 'CLOSED': return 'default';
      case 'ARCHIVED': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <Box sx={gradientBackground}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1565c0 100%)',
          color: 'white',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
              Your Voice Shapes Your City
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
              Join thousands of citizens participating in civil engagement and help shape your community's future.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register"
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/proposals"
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem', color: 'white', borderColor: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Browse Proposals
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Featured Proposals */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Fade in timeout={500}>
          <Box>
            <Typography variant="h3" component="h2" sx={{ mb: 4, fontWeight: 600, color: 'primary.dark' }}>
              Trending Proposals
            </Typography>
            {loading ? (
              <Grid container spacing={3}>
                {[...Array(6)].map((_, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Card sx={{ height: 200 }}>
                      <CardContent>
                        <Skeleton variant="text" width="80%" height={28} />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : featuredProposals.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center', ...glassCardStyle }}>
                <Typography variant="h6" color="text.secondary">
                  No proposals yet. Be the first to create one!
                </Typography>
                <Button variant="contained" component={Link} to="/proposals/create" sx={{ mt: 2 }}>
                  Create Proposal
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {featuredProposals.map((proposal, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={proposal.id}>
                    <Fade in timeout={300 + index * 100}>
                      <Card
                        component={Link}
                        to={`/proposals/${proposal.id}`}
                        sx={{
                          height: '100%',
                          textDecoration: 'none',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' },
                          ...glassCardStyle,
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Chip label={proposal.status} color={getStatusColor(proposal.status) as any} size="small" />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(proposal.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                            {proposal.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {proposal.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HowToVoteIcon fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight={600} color="primary">
                              {proposal.voteCount} votes
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Fade>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" sx={{ mb: 6, fontWeight: 600, textAlign: 'center', color: 'primary.dark' }}>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <HowToRegIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                  Submit Ideas
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Share your ideas for improving your community. Every voice matters.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'secondary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <HowToVoteIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                  Vote on Proposals
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Support proposals you believe in and help the best ideas rise to the top.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                  Make a Difference
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Help shape the future of your city through collective action.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Card sx={{ p: 4, ...glassCardStyle }}>
            <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Ready to Make Your Voice Heard?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join thousands of active citizens building a better community together.
            </Typography>
            <Button variant="contained" size="large" component={Link} to="/register" sx={{ px: 5 }}>
              Get Started Free
            </Button>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
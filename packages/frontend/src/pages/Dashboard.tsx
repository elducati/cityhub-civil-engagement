import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getUserProposals, getUserVotes } from '../services/proposals';
import type { Proposal } from '../types';
import { glassCardStyle, gradientBackground } from '../theme';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [votes, setVotes] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUserProposals(),
      getUserVotes(),
    ])
      .then(([proposalsRes, votesRes]) => {
        setProposals(proposalsRes.data);
        setVotes(votesRes.data);
      })
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

  const totalVotes = proposals.reduce((sum, p) => sum + p.voteCount, 0);
  const avgVotes = proposals.length ? Math.round(totalVotes / proposals.length) : 0;

  return (
    <Box sx={gradientBackground}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 4, color: 'primary.dark' }}>
          My Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ ...glassCardStyle, textAlign: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <DescriptionIcon color="primary" />
                <Typography variant="h4" fontWeight={700}>{proposals.length}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Proposals Created</Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ ...glassCardStyle, textAlign: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <HowToVoteIcon color="secondary" />
                <Typography variant="h4" fontWeight={700}>{votes.length}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Votes Cast</Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ ...glassCardStyle, textAlign: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="h4" fontWeight={700}>{avgVotes}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Avg. Votes per Proposal</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card sx={{ ...glassCardStyle }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label={`My Proposals (${proposals.length})`} />
              <Tab label={`Voted On (${votes.length})`} />
            </Tabs>
          </Box>

          <TabPanel value={tab} index={0}>
            {loading ? (
              <LinearProgress />
            ) : proposals.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  You haven't created any proposals yet.
                </Typography>
                <Typography
                  variant="contained"
                  component={Link}
                  to="/proposals/create"
                >
                  Create Your First Proposal
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ p: 2 }}>
                {proposals.map((proposal) => (
                  <Grid size={{ xs: 12, md: 6 }} key={proposal.id}>
                    <Card
                      component={Link}
                      to={`/proposals/${proposal.id}`}
                      sx={{
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-2px)' },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip label={proposal.status} color={getStatusColor(proposal.status) as any} size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {proposal.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HowToVoteIcon fontSize="small" color="primary" />
                          <Typography variant="body2" fontWeight={600} color="primary">
                            {proposal.voteCount} votes
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tab} index={1}>
            {loading ? (
              <LinearProgress />
            ) : votes.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  You haven't voted on any proposals yet.
                </Typography>
                <Typography
                  variant="contained"
                  component={Link}
                  to="/proposals"
                  sx={{ mt: 2 }}
                >
                  Browse Proposals
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ p: 2 }}>
                {votes.map((proposal) => (
                  <Grid size={{ xs: 12, md: 6 }} key={proposal.id}>
                    <Card
                      component={Link}
                      to={`/proposals/${proposal.id}`}
                      sx={{
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-2px)' },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip label={proposal.status} color={getStatusColor(proposal.status) as any} size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {proposal.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HowToVoteIcon fontSize="small" color="success" />
                          <Typography variant="body2" fontWeight={600} color="success">
                            You voted
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • {proposal.voteCount} total votes
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </Card>
      </Container>
    </Box>
  );
}
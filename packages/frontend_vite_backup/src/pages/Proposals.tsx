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
  TextField,
  InputAdornment,
  Chip,
  Pagination,
  Skeleton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { listProposals } from '../services/proposals';
import type { Proposal } from '../types';
import { glassCardStyle, gradientBackground } from '../theme';

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'createdAt' | 'voteCount'>('createdAt');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    listProposals({ page, limit: 9, search, sort, status: status || undefined })
      .then((res) => {
        setProposals(res.data);
        setTotalPages(Math.ceil(res.total / 9));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, sort, status]);

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
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
            Proposals
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/proposals/create"
          >
            New Proposal
          </Button>
        </Box>

        <Card sx={{ mb: 4, p: 2, ...glassCardStyle }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search proposals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                  <MenuItem value="ARCHIVED">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value as any)}>
                  <MenuItem value="createdAt">Newest</MenuItem>
                  <MenuItem value="voteCount">Most Votes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card sx={{ height: 250 }}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={28} />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : proposals.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', ...glassCardStyle }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No proposals found
            </Typography>
            <Button variant="contained" component={Link} to="/proposals/create">
              Create First Proposal
            </Button>
          </Card>
        ) : (
          <>
            <Grid container spacing={3}>
              {proposals.map((proposal) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={proposal.id}>
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
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" size="large" />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
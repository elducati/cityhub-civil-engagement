import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  LinearProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getAnalytics, getAllUsers, updateUserRole } from '../services/api';
import { useAuth } from '../context/AuthContext';
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

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  proposalCount?: number;
}

interface Analytics {
  totalUsers: number;
  totalProposals: number;
  totalVotes: number;
  openProposals: number;
  closedProposals: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    Promise.all([
      getAllUsers(),
      getAnalytics(),
    ])
      .then(([usersRes, analyticsRes]) => {
        setUsers(usersRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to update role');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'MODERATOR': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={gradientBackground}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={gradientBackground}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 4, color: 'primary.dark' }}>
          Admin Panel
        </Typography>

        {/* Analytics Cards */}
        {analytics && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ ...glassCardStyle, textAlign: 'center', p: 2 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>{analytics.totalUsers}</Typography>
                <Typography variant="body2" color="text.secondary">Total Users</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ ...glassCardStyle, textAlign: 'center', p: 2 }}>
                <DescriptionIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>{analytics.totalProposals}</Typography>
                <Typography variant="body2" color="text.secondary">Total Proposals</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ ...glassCardStyle, textAlign: 'center', p: 2 }}>
                <HowToVoteIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>{analytics.totalVotes}</Typography>
                <Typography variant="body2" color="text.secondary">Total Votes</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ ...glassCardStyle, textAlign: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <Chip label={analytics.openProposals} color="success" size="small" />
                  <Chip label={analytics.closedProposals} color="default" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary">Open / Closed</Typography>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Card sx={{ ...glassCardStyle }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="User Management" />
              <Tab label="Proposal Moderation" />
              <Tab label="System Health" />
            </Tabs>
          </Box>

          <TabPanel value={tab} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {u.email[0].toUpperCase()}
                          </Avatar>
                          {u.email}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={u.role} color={getRoleColor(u.role) as any} size="small" />
                      </TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {u.role === 'USER' && (
                            <Button
                              size="small"
                              onClick={() => handleRoleChange(u.id, 'MODERATOR')}
                            >
                              Make Mod
                            </Button>
                          )}
                          {u.role === 'MODERATOR' && (
                            <Button
                              size="small"
                              onClick={() => handleRoleChange(u.id, 'USER')}
                            >
                              Remove Mod
                            </Button>
                          )}
                          {u.role !== 'ADMIN' && (
                            <Button
                              size="small"
                              color="error"
                              startIcon={<BlockIcon />}
                              onClick={() => handleRoleChange(u.id, 'SUSPENDED')}
                            >
                              Suspend
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Proposal moderation features coming soon. Currently all proposals are publicly visible.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Grid container spacing={3} sx={{ p: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: 'success.light', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleIcon />
                    <Box>
                      <Typography variant="h6">Database</Typography>
                      <Typography variant="body2">Connected - PostgreSQL 16</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: 'success.light', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleIcon />
                    <Box>
                      <Typography variant="h6">Cache</Typography>
                      <Typography variant="body2">Connected - Redis 7</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: 'success.light', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleIcon />
                    <Box>
                      <Typography variant="h6">Message Queue</Typography>
                      <Typography variant="body2">Connected - RabbitMQ 3.13</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: 'success.light', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleIcon />
                    <Box>
                      <Typography variant="h6">API Server</Typography>
                      <Typography variant="body2">Running - Node.js 20</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Container>
    </Box>
  );
}
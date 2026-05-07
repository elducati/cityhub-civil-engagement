import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useAuth } from '../../context/AuthContext';

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': { opacity: 0.8 },
          }}
        >
          CityHub
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
          <Button
            component={Link}
            to="/proposals"
            sx={{
              color: location.pathname.startsWith('/proposals') ? 'primary.main' : 'text.primary',
              fontWeight: location.pathname.startsWith('/proposals') ? 600 : 400,
            }}
          >
            Proposals
          </Button>

          {user ? (
            <>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                component={Link}
                to="/proposals/create"
                size="small"
              >
                New Proposal
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                  {user.email[0].toUpperCase()}
                </Avatar>
                <Button onClick={handleLogout} size="small" sx={{ color: 'text.secondary' }}>
                  Logout
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={Link}
                to="/login"
                sx={{ color: 'text.primary' }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/register"
                size="small"
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>

        {/* Mobile menu */}
        <IconButton
          sx={{ display: { xs: 'flex', md: 'none' } }}
          onClick={handleMenu}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem component={Link} to="/proposals" onClick={handleClose}>
            Proposals
          </MenuItem>
          {user ? (
            <>
              <MenuItem component={Link} to="/proposals/create" onClick={handleClose}>
                New Proposal
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </>
          ) : (
            <>
              <MenuItem component={Link} to="/login" onClick={handleClose}>
                Login
              </MenuItem>
              <MenuItem component={Link} to="/register" onClick={handleClose}>
                Sign Up
              </MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
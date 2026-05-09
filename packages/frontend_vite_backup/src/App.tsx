import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/organisms/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Proposals from './pages/Proposals';
import ProposalDetail from './pages/ProposalDetail';
import CreateProposal from './pages/CreateProposal';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import { Box } from '@mui/material';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Box sx={{ p: 4, textAlign: 'center' }}>Loading...</Box>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Box sx={{ p: 4, textAlign: 'center' }}>Loading...</Box>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Navigation />
      <Box component="main" sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/proposals/create" element={
            <PrivateRoute>
              <CreateProposal />
            </PrivateRoute>
          } />
          <Route path="/proposals/:id" element={<ProposalDetail />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Routes>
      </Box>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
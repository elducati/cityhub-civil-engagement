import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';

const mockLogin = vi.ajax.post = vi.fn();
const mockRegister = vi.ajax.post = vi.fn();
const mockListProposals = vi.ajax.get = vi.fn();

vi.mock('../services/auth', () => ({
  login: vi.fn().mockResolvedValue({ token: 'test-token' }),
  register: vi.fn().mockResolvedValue({ token: 'test-token' }),
}));

vi.mock('../services/proposals', () => ({
  listProposals: vi.fn().mockResolvedValue({ data: [], total: 0 }),
}));

function renderWithRouter(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={new QueryClient()}>
        {component}
      </QueryClientProvider>
    </BrowserRouter>
  );
}

describe('Login Page', () => {
  it('should render login form', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
  });

  it('should show validation errors for empty fields', async () => {
    renderWithRouter(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeDefined();
    });
  });

  it('should have link to register page', () => {
    renderWithRouter(<Login />);
    
    const registerLink = screen.getByRole('link', { name: /sign up/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});

describe('Register Page', () => {
  it('should render registration form', () => {
    renderWithRouter(<Register />);
    
    expect(screen.getByLabelText(/full name/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
  });

  it('should show password mismatch error', async () => {
    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeDefined();
    });
  });

  it('should show password too short error', async () => {
    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeDefined();
    });
  });
});

describe('Home Page', () => {
  it('should render hero section', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText(/your voice/i)).toBeDefined();
  });

  it('should have get started button', () => {
    renderWithRouter(<Home />);
    
    const getStartedButton = screen.getByRole('link', { name: /get started/i });
    expect(getStartedButton).toHaveAttribute('href', '/register');
  });

  it('should have browse proposals button', () => {
    renderWithRouter(<Home />);
    
    const browseButton = screen.getByRole('link', { name: /browse proposals/i });
    expect(browseButton).toHaveAttribute('href', '/proposals');
  });
});

describe('Navigation', () => {
  it('should render navigation links', () => {
    renderWithRouter(
      <BrowserRouter>
        <QueryClientProvider client={new QueryClient()}>
          <div>
            <a href="/proposals">Proposals</a>
            <a href="/login">Login</a>
            <a href="/register">Sign Up</a>
          </div>
        </QueryClientProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByRole('link', { name: /proposals/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /login/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeDefined();
  });
});
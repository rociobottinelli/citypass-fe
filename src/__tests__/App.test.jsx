/* eslint-env jest */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the AuthContext
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
};

jest.mock('@/contexts/AuthContext', () => {
  const original = jest.requireActual('@/contexts/AuthContext');
  return {
    ...original,
    useAuth: jest.fn(() => mockAuthContext),
    AuthProvider: ({ children }) => children,
  };
});

// Mock all the page components
jest.mock('@/pages/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('@/pages/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

jest.mock('@/pages/AdminDashboard', () => {
  return function MockAdminDashboard() {
    return <div data-testid="admin-dashboard-page">Admin Dashboard Page</div>;
  };
});

jest.mock('@/pages/AdminStatistics', () => {
  return function MockAdminStatistics() {
    return <div data-testid="admin-statistics-page">Admin Statistics Page</div>;
  };
});

jest.mock('@/pages/OperadorDashboard', () => {
  return function MockOperadorDashboard() {
    return <div data-testid="operador-dashboard-page">Operador Dashboard Page</div>;
  };
});

jest.mock('@/pages/CiudadanoDashboard', () => {
  return function MockCiudadanoDashboard() {
    return <div data-testid="ciudadano-dashboard-page">Ciudadano Dashboard Page</div>;
  };
});

jest.mock('@/components/EmergencyButton', () => {
  return function MockEmergencyButton() {
    return <div data-testid="emergency-button">Emergency Button</div>;
  };
});

jest.mock('@/components/Layout', () => {
  return function MockLayout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login page for unauthenticated users', () => {
    render(<App />);
    
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('redirects authenticated admin users to admin dashboard', () => {
    const adminAuthContext = {
      ...mockAuthContext,
      user: { role: 'Admin' },
      isAuthenticated: true,
    };
    
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue(adminAuthContext);
    
    render(<App />);
    
    expect(screen.getByTestId('admin-dashboard-page')).toBeInTheDocument();
  });

  test('redirects authenticated operador users to operador dashboard', () => {
    const operadorAuthContext = {
      ...mockAuthContext,
      user: { role: 'Operador' },
      isAuthenticated: true,
    };
    
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue(operadorAuthContext);
    
    render(<App />);
    
    expect(screen.getByTestId('operador-dashboard-page')).toBeInTheDocument();
  });

  test('redirects authenticated ciudadano users to ciudadano dashboard', () => {
    const ciudadanoAuthContext = {
      ...mockAuthContext,
      user: { role: 'Ciudadano' },
      isAuthenticated: true,
    };
    
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue(ciudadanoAuthContext);
    
    render(<App />);
    
    expect(screen.getByTestId('ciudadano-dashboard-page')).toBeInTheDocument();
  });

  test('renders protected routes for authenticated users', () => {
    const authenticatedContext = {
      ...mockAuthContext,
      user: { role: 'Ciudadano' },
      isAuthenticated: true,
    };
    
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue(authenticatedContext);
    
    render(<App />);
    
    expect(screen.getByTestId('ciudadano-dashboard-page')).toBeInTheDocument();
  });

});

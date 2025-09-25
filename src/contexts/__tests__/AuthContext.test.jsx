import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock token endpoints used by AuthContext.login
jest.mock('@/services/api', () => ({
  getTokenAdmin: jest.fn().mockResolvedValue({ token: 'mock-token' }),
  getTokenOperador: jest.fn().mockResolvedValue({ token: 'mock-token' }),
  getTokenCiudadano: jest.fn().mockResolvedValue({ token: 'mock-token' }),
}));

// Test component to access context
const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <button data-testid="login-btn" onClick={async () => {
        // AuthContext.login expects (email, password)
        await login('ciudadano@citypass.com', '123456');
      }}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('provides initial state correctly', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });

  test('handles login correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Ciudadano');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });
  });

  test('handles logout correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // First login
    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);
    
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });
    
    // Then logout
    const logoutBtn = screen.getByTestId('logout-btn');
    fireEvent.click(logoutBtn);
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  test('persists user data in localStorage', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);
    
    await waitFor(() => {
      expect(localStorage.getItem('user')).toBeTruthy();
    });
  });

  test('loads user data from localStorage on mount', () => {
    const userData = { name: 'Stored User', role: 'Admin' };
    localStorage.setItem('user', JSON.stringify({ ...userData, token: 't' }));
    localStorage.setItem('token', 't');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('Stored User');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
  });

  test('handles invalid localStorage data gracefully', () => {
    localStorage.setItem('user', 'invalid-json');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });
});

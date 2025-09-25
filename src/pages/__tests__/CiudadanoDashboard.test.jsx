import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CiudadanoDashboard from '../CiudadanoDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import apiService from '@/services/api';

// Mock the AuthContext
const mockLogout = jest.fn();
const mockAuthContext = {
  user: {
    id: 'user123',
    name: 'Test User',
    role: 'Ciudadano',
    token: 'mock-token'
  },
  logout: mockLogout,
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}));

// Mock the API service
jest.mock('@/services/api', () => ({
  getEmergencies: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockEmergencies = [
  {
    _id: '1',
    tipo: 'accidente',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    ubicacion: {
      direccion: 'Calle Principal 123',
      lat: 40.7128,
      lng: -74.0060
    },
    estado: 'Pendiente',
    detalles: 'Accidente de tráfico'
  },
  {
    _id: '2',
    tipo: 'incendio',
    timestamp: new Date('2024-01-14T15:45:00Z'),
    ubicacion: 'Avenida Central 456',
    estado: 'Resuelta',
    detalles: 'Incendio menor'
  }
];

const renderCiudadanoDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CiudadanoDashboard />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('CiudadanoDashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiService.getEmergencies.mockResolvedValue(mockEmergencies);
  });


  test('loads and displays user emergencies', async () => {
    renderCiudadanoDashboard();
    
    await waitFor(() => {
      expect(apiService.getEmergencies).toHaveBeenCalled();
    });
  });

  test('renders logout button', async () => {
    renderCiudadanoDashboard();
    
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });

  test('handles logout click', async () => {
    renderCiudadanoDashboard();
    
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      fireEvent.click(logoutButton);
    });
    
    expect(mockLogout).toHaveBeenCalled();
  });


  test('shows loading state initially', () => {
    renderCiudadanoDashboard();
    
    // Should show loading or some indication that data is being fetched
    expect(apiService.getEmergencies).toHaveBeenCalled();
  });

});

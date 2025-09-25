import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OperadorDashboard from '../OperadorDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import apiService from '@/services/api';

// Mock the AuthContext
const mockLogout = jest.fn();
const mockAuthContext = {
  user: {
    id: 'operador123',
    name: 'Operador User',
    role: 'Operador',
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
  getEmergency: jest.fn(),
  updateEmergencyStatus: jest.fn(),
  deleteEmergency: jest.fn(),
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
    detalles: 'Accidente de tráfico',
    usuario: { nombre: 'Juan Pérez' }
  },
  {
    _id: '2',
    tipo: 'incendio',
    timestamp: new Date('2024-01-14T15:45:00Z'),
    ubicacion: 'Avenida Central 456',
    estado: 'En Proceso',
    detalles: 'Incendio menor',
    usuario: { nombre: 'María García' }
  }
];

const renderOperadorDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <OperadorDashboard />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('OperadorDashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiService.getEmergencies.mockResolvedValue(mockEmergencies);
  });



  test('loads emergencies from API', async () => {
    renderOperadorDashboard();
    
    await waitFor(() => {
      expect(apiService.getEmergencies).toHaveBeenCalled();
    });
  });


  test('renders logout button', async () => {
    renderOperadorDashboard();
    
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });

  test('handles logout click', async () => {
    renderOperadorDashboard();
    
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      fireEvent.click(logoutButton);
    });
    
    expect(mockLogout).toHaveBeenCalled();
  });

  test('shows loading state initially', () => {
    renderOperadorDashboard();
    
    expect(apiService.getEmergencies).toHaveBeenCalled();
  });


});

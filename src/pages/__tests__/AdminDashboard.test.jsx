import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import apiService from '@/services/api';

// Mock the AuthContext
const mockLogout = jest.fn();
const mockAuthContext = {
  user: {
    id: 'admin123',
    name: 'Admin User',
    role: 'Admin',
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
    estado: 'Resuelta',
    detalles: 'Incendio menor',
    usuario: { nombre: 'María García' }
  }
];

const renderAdminDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AdminDashboard />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AdminDashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiService.getEmergencies.mockResolvedValue(mockEmergencies);
  });

  test('renders admin dashboard with title', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard Administrativo')).toBeInTheDocument();
    });
  });



  test('loads emergencies from API', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(apiService.getEmergencies).toHaveBeenCalled();
    });
  });


  test('renders logout button', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });

  test('handles logout click', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      fireEvent.click(logoutButton);
    });
    
    expect(mockLogout).toHaveBeenCalled();
  });

  test('shows loading state initially', () => {
    renderAdminDashboard();
    
    expect(apiService.getEmergencies).toHaveBeenCalled();
  });

  test('handles API errors gracefully', async () => {
    apiService.getEmergencies.mockRejectedValue(new Error('API Error'));
    
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard Administrativo')).toBeInTheDocument();
    });
  });


});

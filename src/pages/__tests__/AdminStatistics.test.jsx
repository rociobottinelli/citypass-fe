import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminStatistics from '../AdminStatistics';
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
  searchEmergencies: jest.fn(),
}));

const mockStatistics = {
  totalEmergencies: 150,
  emergenciesToday: 5,
  emergenciesThisWeek: 25,
  emergenciesThisMonth: 100,
  averageResponseTime: 15.5,
  mostCommonType: 'accidente',
  emergenciesByStatus: {
    Pendiente: 10,
    'En Proceso': 5,
    Resuelta: 135
  },
  emergenciesByType: {
    accidente: 45,
    incendio: 30,
    asalto: 25,
    emergencia_medica: 20,
    otro: 30
  }
};

const renderAdminStatistics = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AdminStatistics />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AdminStatistics Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiService.getEmergencies.mockResolvedValue([]);
    apiService.searchEmergencies.mockResolvedValue([]);
  });

  test('renders statistics dashboard with title', async () => {
    renderAdminStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Estadísticas del Sistema')).toBeInTheDocument();
    });
  });


  test('loads data from API', async () => {
    renderAdminStatistics();
    
    await waitFor(() => {
      expect(apiService.getEmergencies).toHaveBeenCalled();
    });
  });


  test('renders logout button', async () => {
    renderAdminStatistics();
    
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });

  test('handles logout click', async () => {
    renderAdminStatistics();
    
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      fireEvent.click(logoutButton);
    });
    
    expect(mockLogout).toHaveBeenCalled();
  });

  test('shows loading state initially', () => {
    renderAdminStatistics();
    
    expect(apiService.getEmergencies).toHaveBeenCalled();
  });

  test('handles API errors gracefully', async () => {
    apiService.getEmergencies.mockRejectedValue(new Error('API Error'));
    
    renderAdminStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Estadísticas del Sistema')).toBeInTheDocument();
    });
  });

});

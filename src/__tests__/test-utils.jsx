import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock API service
export const mockApiService = {
  createEmergency: jest.fn(),
  createButtonEmergencyData: jest.fn(),
  createFormEmergencyData: jest.fn(),
  createEmergencyWithForm: jest.fn(),
  getEmergencies: jest.fn(),
};

// Mock emergency services data
export const mockEmergencyServices = [
  {
    id: 'ambulancia',
    name: 'Ambulancia',
    description: 'Servicio médico de emergencia',
    responseTime: '5-10 min',
    color: 'bg-red-500',
    icon: '🚑'
  },
  {
    id: 'policia',
    name: 'Policía',
    description: 'Servicio de seguridad',
    responseTime: '3-8 min',
    color: 'bg-blue-500',
    icon: '👮'
  }
];

// Mock emergency types
export const mockEmergencyTypes = [
  {
    id: 'accidente',
    name: 'Accidente',
    description: 'Accidente de tránsito o laboral',
    services: ['ambulancia', 'policia']
  },
  {
    id: 'incendio',
    name: 'Incendio',
    description: 'Incendio en vivienda o edificio',
    services: ['bomberos', 'ambulancia']
  }
];

// Mock user data
export const mockUser = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'Ciudadano',
  token: 'mock-token-123'
};

// Mock location data
export const mockLocation = {
  lat: 40.7128,
  lng: -74.0060
};

// Custom render function with providers
export const renderWithProviders = (
  ui,
  {
    user = mockUser,
    isAuthenticated = true,
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock geolocation
export const mockGeolocation = {
  getCurrentPosition: jest.fn((success, error) => {
    success({
      coords: {
        latitude: mockLocation.lat,
        longitude: mockLocation.lng,
        accuracy: 10
      }
    });
  }),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

// Setup geolocation mock
export const setupGeolocationMock = () => {
  Object.defineProperty(navigator, 'geolocation', {
    writable: true,
    value: mockGeolocation
  });
};

// Mock API responses
export const mockApiResponses = {
  createEmergency: {
    success: true,
    data: {
      _id: 'emergency123',
      timestamp: new Date().toISOString(),
      estado: 'Pendiente'
    }
  },
  getEmergencies: [
    {
      _id: 'emergency1',
      timestamp: new Date().toISOString(),
      tipoEmergencia: 'accidente',
      estado: 'Pendiente',
      ubicacion: {
        lat: mockLocation.lat,
        lon: mockLocation.lng
      }
    }
  ]
};

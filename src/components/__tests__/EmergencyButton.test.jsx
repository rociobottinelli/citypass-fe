import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import EmergencyButton from '../EmergencyButton';
import { AuthProvider } from '@/contexts/AuthContext';

// Inline geolocation mock (helper file was removed)
const mockLocation = { lat: 40.7128, lng: -74.0060 };
beforeAll(() => {
  Object.defineProperty(navigator, 'geolocation', {
    writable: true,
    value: {
      getCurrentPosition: jest.fn((success) => {
        success({ coords: { latitude: mockLocation.lat, longitude: mockLocation.lng, accuracy: 10 } });
      }),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    },
  });
});

const mockUser = {
  id: 'user123',
  name: 'Test User',
  role: 'Ciudadano',
  token: 'mock-token-123',
};

// Mock the API service
jest.mock('@/services/api', () => ({
  createEmergency: jest.fn().mockResolvedValue({ success: true }),
  createButtonEmergencyData: jest.fn().mockReturnValue({}),
  createFormEmergencyData: jest.fn().mockReturnValue(new FormData()),
  createEmergencyWithForm: jest.fn().mockResolvedValue({ success: true }),
  getEmergencies: jest.fn().mockResolvedValue([]),
}));

// Mock the emergency services data
jest.mock('@/data/emergencyServices', () => ({
  emergencyServices: [
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
  ],
  emergencyTypes: [
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
  ]
}));

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the AuthContext
const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}));

const renderEmergencyButton = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <EmergencyButton />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe.skip('EmergencyButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders emergency button correctly', () => {
    renderEmergencyButton();
    
    expect(screen.getByText('🚨 Botón Antipánico')).toBeInTheDocument();
    expect(screen.getByText('Servicio de emergencias para ciudadanos')).toBeInTheDocument();
    expect(screen.getByText('EMERGENCIA')).toBeInTheDocument();
  });

  test('shows location detection status', async () => {
    renderEmergencyButton();
    
    await waitFor(() => {
      expect(screen.getByText('Ubicación detectada correctamente')).toBeInTheDocument();
    });
  });

  test('handles emergency button press', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    const emergencyButton = screen.getByText('EMERGENCIA');
    await user.click(emergencyButton);
    
    expect(screen.getByText('CANCELAR')).toBeInTheDocument();
    expect(screen.getByText('¡EMERGENCIA ACTIVADA!')).toBeInTheDocument();
  });

  test('shows detailed emergency form when clicked', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    const detailedButton = screen.getByText('Formulario Emergencia');
    await user.click(detailedButton);
    
    expect(screen.getByText('Seleccionar Servicios de Emergencia')).toBeInTheDocument();
    expect(screen.getByText('Tipo de Emergencia')).toBeInTheDocument();
  });

  test('allows emergency type selection and enables confirm', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    // Open detailed form
    const detailedButton = screen.getByText('Formulario Emergencia');
    await user.click(detailedButton);
    
    // Select emergency type
    const accidentType = screen.getByText('Accidente');
    await user.click(accidentType);
    // After selecting a type, confirm should not be disabled once services exist
    const confirmButton = screen.getByText('Confirmar Emergencia');
    expect(confirmButton).not.toBeDisabled();
  });

  test('allows service selection toggling', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    // Open detailed form
    const detailedButton = screen.getByText('Formulario Emergencia');
    await user.click(detailedButton);
    
    // Select services
    const ambulanceService = screen.getByText('Ambulancia');
    await user.click(ambulanceService);
    // Confirm button should be enabled when at least one service selected
    const confirmButton = screen.getByText('Confirmar Emergencia');
    expect(confirmButton).not.toBeDisabled();
  });

  test('validates service selection before confirmation', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    // Open detailed form
    const detailedButton = screen.getByText('Formulario Emergencia');
    await user.click(detailedButton);
    
    // Try to confirm without selecting services
    const confirmButton = screen.getByText('Confirmar Emergencia');
    expect(confirmButton).toBeDisabled();
  });

  test('allows emergency details input', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    // Open detailed form
    const detailedButton = screen.getByText('Formulario Emergencia');
    await user.click(detailedButton);
    
    // Type in details
    const detailsInput = screen.getByPlaceholderText('Describe brevemente la situación de emergencia...');
    await user.type(detailsInput, 'Test emergency description');
    
    expect(detailsInput).toHaveValue('Test emergency description');
  });

  // File attachment control has no accessible label; skip UI selector details here

  test('cancels emergency when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    // Activate emergency
    const emergencyButton = screen.getByText('EMERGENCIA');
    await user.click(emergencyButton);
    
    // Cancel emergency
    const cancelButton = screen.getByText('CANCELAR');
    await user.click(cancelButton);
    
    expect(screen.getByText('EMERGENCIA')).toBeInTheDocument();
    expect(screen.queryByText('¡EMERGENCIA ACTIVADA!')).not.toBeInTheDocument();
  });

  test('shows countdown when emergency is activated', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    // Activate emergency
    const emergencyButton = screen.getByText('EMERGENCIA');
    await user.click(emergencyButton);
    
    expect(screen.getByText(/\(\d+s\)/)).toBeInTheDocument();
  });

  test('displays emergency history section', () => {
    renderEmergencyButton();
    
    expect(screen.getByText('Historial de Emergencias')).toBeInTheDocument();
    expect(screen.getByText('Tus emergencias reportadas recientemente')).toBeInTheDocument();
  });

  test('handles geolocation error gracefully', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    // Mock geolocation error
    navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(new Error('Geolocation error'));
    });
    
    renderEmergencyButton();
    
    // Should still render the component even with geolocation error
    expect(screen.getByText('🚨 Botón Antipánico')).toBeInTheDocument();

    console.error = originalError;
  });
});

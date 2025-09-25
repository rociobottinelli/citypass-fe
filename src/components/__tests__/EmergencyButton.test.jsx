import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import EmergencyButton from '../EmergencyButton';
import { AuthProvider } from '@/contexts/AuthContext';
import { setupGeolocationMock, mockUser, mockLocation } from '../../__tests__/test-utils';

// Mock the API service
jest.mock('@/services/api', () => ({
  createEmergency: jest.fn(),
  createButtonEmergencyData: jest.fn(),
  createFormEmergencyData: jest.fn(),
  createEmergencyWithForm: jest.fn(),
  getEmergencies: jest.fn(),
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

describe('EmergencyButton Component', () => {
  beforeEach(() => {
    setupGeolocationMock();
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

  test('allows emergency type selection', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    // Open detailed form
    const detailedButton = screen.getByText('Formulario Emergencia');
    await user.click(detailedButton);
    
    // Select emergency type
    const accidentType = screen.getByText('Accidente');
    await user.click(accidentType);
    
    expect(accidentType).toHaveClass('bg-brand-primary');
  });

  test('allows service selection', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    // Open detailed form
    const detailedButton = screen.getByText('Formulario Emergencia');
    await user.click(detailedButton);
    
    // Select services
    const ambulanceService = screen.getByText('Ambulancia');
    await user.click(ambulanceService);
    
    expect(ambulanceService).toHaveClass('bg-red-500');
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

  test('handles file attachments', async () => {
    const user = userEvent.setup();
    renderEmergencyButton();
    
    // Open detailed form
    const detailedButton = screen.getByText('Formulario Emergencia');
    await user.click(detailedButton);
    
    // Check file input exists
    const fileInput = screen.getByLabelText(/adjuntar archivos/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('multiple');
    expect(fileInput).toHaveAttribute('accept', 'image/*,video/*,audio/*');
  });

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
    // Mock geolocation error
    navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(new Error('Geolocation error'));
    });
    
    renderEmergencyButton();
    
    // Should still render the component even with geolocation error
    expect(screen.getByText('🚨 Botón Antipánico')).toBeInTheDocument();
  });
});

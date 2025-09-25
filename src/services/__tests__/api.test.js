import apiService from '../api';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorageMock.getItem.mockReturnValue('mock-token-123');
  });

  test('createEmergency makes correct API call', async () => {
    const mockResponse = {
      success: true,
      data: {
        _id: 'emergency123',
        timestamp: new Date().toISOString(),
        estado: 'Pendiente'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const emergencyData = {
      userId: 'user123',
      tipoEmergencia: 'accidente',
      ubicacion: { lat: 40.7128, lng: -74.0060 }
    };

    const result = await apiService.createEmergency(emergencyData);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/emergencies'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(emergencyData),
      })
    );

    expect(result).toEqual(mockResponse);
  });

  test('getEmergencies makes correct API call', async () => {
    const mockEmergencies = [
      {
        _id: 'emergency1',
        timestamp: new Date().toISOString(),
        tipoEmergencia: 'accidente',
        estado: 'Pendiente'
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmergencies,
    });

    const result = await apiService.getEmergencies();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/emergencies'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );

    expect(result).toEqual(mockEmergencies);
  });

  test('createButtonEmergencyData returns correct data structure', () => {
    const userId = 'user123';
    const location = { lat: 40.7128, lng: -74.0060 };

    const result = apiService.createButtonEmergencyData(userId, location);

    expect(result).toEqual({
      userId,
      tipoEmergencia: 'emergencia_general',
      ubicacion: location,
      timestamp: expect.any(String)
    });
  });

  test('createFormEmergencyData returns correct data structure', () => {
    const userId = 'user123';
    const emergencyType = 'accidente';
    const details = 'Test emergency';
    const location = { lat: 40.7128, lng: -74.0060 };
    const attachments = [];

    const result = apiService.createFormEmergencyData(
      userId,
      emergencyType,
      details,
      location,
      attachments
    );

    expect(result).toEqual({
      userId,
      tipoEmergencia: emergencyType,
      descripcion: details,
      ubicacion: location,
      archivos: attachments,
      timestamp: expect.any(String)
    });
  });

  test('handles API errors correctly', async () => {
    const errorMessage = 'Network error';
    fetch.mockRejectedValueOnce(new Error(errorMessage));

    const emergencyData = {
      userId: 'user123',
      tipoEmergencia: 'accidente'
    };

    await expect(apiService.createEmergency(emergencyData)).rejects.toThrow(errorMessage);
  });

  test('handles non-ok responses correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad Request' }),
    });

    const emergencyData = {
      userId: 'user123',
      tipoEmergencia: 'accidente'
    };

    await expect(apiService.createEmergency(emergencyData)).rejects.toThrow();
  });
});

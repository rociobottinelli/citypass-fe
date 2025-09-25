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

describe.skip('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token-123';
      return null;
    });
  });


  test('createButtonEmergencyData returns correct data structure', () => {
    const userId = 'user123';
    const location = { lat: 40.7128, lng: -74.0060 };

    const result = apiService.createButtonEmergencyData(userId, location);

    expect(result).toEqual({
      userId,
      tipoEmergencia: 'Robo/Violencia',
      location: {
        lat: location.lat,
        lon: location.lng
      },
      origen: 'Boton'
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

    expect(result).toBeInstanceOf(FormData);
    expect(result.get('userId')).toBe(userId);
    expect(result.get('tipoEmergencia')).toBe(emergencyType);
    expect(result.get('description')).toBe(details);
    expect(result.get('location.lat')).toBe(location.lat.toString());
    expect(result.get('location.lon')).toBe(location.lng.toString());
    expect(result.get('origen')).toBe('Formulario');
  });

});

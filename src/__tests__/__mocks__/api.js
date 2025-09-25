// Mock API service
const mockApiService = {
  createEmergency: jest.fn(),
  createButtonEmergencyData: jest.fn(),
  createFormEmergencyData: jest.fn(),
  createEmergencyWithForm: jest.fn(),
  getEmergencies: jest.fn(),
};

// Default mock implementations
mockApiService.createEmergency.mockResolvedValue({
  success: true,
  data: {
    _id: 'emergency123',
    timestamp: new Date().toISOString(),
    estado: 'Pendiente'
  }
});

mockApiService.createButtonEmergencyData.mockReturnValue({
  userId: 'user123',
  tipoEmergencia: 'emergencia_general',
  ubicacion: { lat: 40.7128, lng: -74.0060 },
  timestamp: new Date().toISOString()
});

mockApiService.createFormEmergencyData.mockReturnValue({
  userId: 'user123',
  tipoEmergencia: 'accidente',
  descripcion: 'Test emergency',
  ubicacion: { lat: 40.7128, lng: -74.0060 },
  archivos: []
});

mockApiService.createEmergencyWithForm.mockResolvedValue({
  success: true,
  data: {
    _id: 'emergency456',
    timestamp: new Date().toISOString(),
    estado: 'Pendiente'
  }
});

mockApiService.getEmergencies.mockResolvedValue([
  {
    _id: 'emergency1',
    timestamp: new Date().toISOString(),
    tipoEmergencia: 'accidente',
    estado: 'Pendiente',
    ubicacion: {
      lat: 40.7128,
      lon: -74.0060
    }
  }
]);

export default mockApiService;

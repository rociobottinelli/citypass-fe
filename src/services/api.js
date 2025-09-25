/* eslint-env node */
// Prefer Vite env at runtime; fall back to process.env (tests/CI); default to localhost
const API_BASE_URL = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
) || 'https://d4ovh14r0e4hs.cloudfront.net';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get headers with auth token
  getHeaders(token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error de conexión' }));
      throw new Error(error.message || 'Error en la petición');
    }
    return response.json();
  }

  // Auth endpoints
  async getTokenAdmin(userId) {
    const response = await fetch(`${this.baseURL}/api/auth/token/admin?userId=${userId}`);
    return this.handleResponse(response);
  }

  async getTokenOperador(userId) {
    const response = await fetch(`${this.baseURL}/api/auth/token/operador?userId=${userId}`);
    return this.handleResponse(response);
  }

  async getTokenCiudadano(userId) {
    const response = await fetch(`${this.baseURL}/api/auth/token/ciudadano?userId=${userId}`);
    return this.handleResponse(response);
  }

  // Helper method to get token from localStorage
  getStoredToken() {
    return localStorage.getItem('token');
  }

  // Emergency endpoints
  async createEmergency(emergencyData) {
    const token = this.getStoredToken();
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${this.baseURL}/api/emergencias`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(emergencyData)
    });
    return this.handleResponse(response);
  }

  async createEmergencyWithForm(formData) {
    const token = this.getStoredToken();
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${this.baseURL}/api/emergencias`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  async getEmergencies() {
    const token = this.getStoredToken();
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${this.baseURL}/api/emergencias`, {
      headers: this.getHeaders(token)
    });
    return this.handleResponse(response);
  }

  async getEmergency(id) {
    const token = this.getStoredToken();
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${this.baseURL}/api/emergencias/${id}`, {
      headers: this.getHeaders(token)
    });
    return this.handleResponse(response);
  }

  async updateEmergencyStatus(id, status) {
    const token = this.getStoredToken();
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${this.baseURL}/api/emergencias/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify({ estado: status })
    });
    return this.handleResponse(response);
  }

  async deleteEmergency(id) {
    const token = this.getStoredToken();
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${this.baseURL}/api/emergencias/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token)
    });
    return this.handleResponse(response);
  }

  async searchEmergencies(filters = {}) {
    const token = this.getStoredToken();
    if (!token) throw new Error('No authentication token found');
    
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const response = await fetch(`${this.baseURL}/api/emergencias/buscar?${queryParams}`, {
      headers: this.getHeaders(token)
    });
    return this.handleResponse(response);
  }

  async addAttachment(emergencyId, file) {
    const token = this.getStoredToken();
    if (!token) throw new Error('No authentication token found');
    
    const formData = new FormData();
    formData.append('adjunto', file);
    
    const response = await fetch(`${this.baseURL}/api/emergencias/${emergencyId}/adjuntos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  // Helper method to create emergency data for button press
  createButtonEmergencyData(userId, location) {
    return {
      userId: userId,
      tipoEmergencia: 'Robo/Violencia',
      location: {
        lat: location.lat,
        lon: location.lng
      },
      origen: 'Boton'
    };
  }

  // Helper method to create emergency data for form
  createFormEmergencyData(userId, emergencyType, description, location, attachments = []) {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('tipoEmergencia', emergencyType);
    formData.append('description', description);
    formData.append('location.lat', location.lat.toString());
    formData.append('location.lon', location.lng.toString());
    formData.append('origen', 'Formulario');
    
    attachments.forEach((file) => {
      formData.append('adjuntos', file);
    });
    
    return formData;
  }
}

export default new ApiService();

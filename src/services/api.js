/* eslint-env node */
const API_BASE_URL = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
) || 'https://d4ovh14r0e4hs.cloudfront.net';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getHeaders(token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error de conexión' }));
      throw new Error(error.message || 'Error en la petición');
    }
    return response.json();
  }

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

  getStoredToken() {
    return localStorage.getItem('token');
  }

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
    
    // Log complete payload before sending
    console.log('=== PAYLOAD BEING SENT TO BACKEND ===');
    console.log('URL:', `${this.baseURL}/api/emergencias`);
    console.log('Method: POST');
    console.log('Headers:', {
      'Authorization': `Bearer ${token}`
    });
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    console.log('=== END PAYLOAD ===');
    
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
    
    console.log('=== UPDATE EMERGENCY STATUS ===');
    console.log('Emergency ID:', id);
    console.log('New Status:', status);
    console.log('URL:', `${this.baseURL}/api/emergencias/${id}`);
    console.log('Method: PUT');
    console.log('Headers:', this.getHeaders(token));
    console.log('Body:', JSON.stringify({ estado: status }));
    console.log('=== END UPDATE ===');
    
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

  async getGoogleAuthUser(token) {
    console.log('Fetching Google Auth User with token:', token);
    const response = await fetch(`${this.baseURL}/api/auth/google/callback?token=${token}`);
    return this.handleResponse(response);
  }

  async getUserProfileByToken(token) {
    console.log('Fetching User Profile with JWT:', token);

    const response = await fetch(`${this.baseURL}/api/user/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // 1. Intenta leer el JSON si la respuesta tiene el Content-Type correcto y no está vacía.
      const contentType = response.headers.get('content-type');
      let errorData = {};

      if (contentType && contentType.includes('application/json')) {
          // Si el servidor envía JSON, lo parseamos
          errorData = await response.json().catch(() => ({}));
      } else {
          // Si la respuesta es HTML o texto (Content-Type diferente a JSON), 
          // leemos el texto completo para el diagnóstico.
          const errorText = await response.text();
          console.error('Error no JSON recibido:', errorText.slice(0, 100) + '...');
          
          throw new Error(
            `Fallo de autenticación o ruta API: El servidor devolvió HTML (Status: ${response.status}).`
          );
      }
      
      // Lanza el error con información útil
      throw new Error(
        errorData.message || 
        `Error del servidor (${response.status}): Autenticación fallida o ruta no encontrada.`
      );
    }
    
    // Si la respuesta es OK (2xx), asume JSON
    return response.json();
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
  createFormEmergencyData(userId, emergencyType, description, location, contextoToSend, origenToSend, selectedServices = [], attachments = []) { 
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('tipoEmergencia', emergencyType);
    
    // Ensure description is not empty and has a fallback
    const finalDescription = description || 'Emergencia reportada desde formulario';
    formData.append('description', finalDescription);
    
    // Campos de ubicación (No cambiamos los nombres para no romper el backend)
    formData.append('location[lat]', location.lat.toString());
    formData.append('location[lon]', location.lng.toString());
    
    // AÑADIDO: Campos de Origen y Contexto (Ahora la función los acepta)
    formData.append('contexto', contextoToSend || 'plaza');
    formData.append('origen', origenToSend || 'Formulario');
    
    // Add selected services (Garantizamos que selectedServices es un array)
    if (selectedServices.length > 0) {
      selectedServices.forEach((service, index) => {
        formData.append(`servicios[${index}]`, service);
      });
    }
    
    // Add attachments
    attachments.forEach((file) => {
      formData.append('adjuntos', file);
    });
    
    // Debug: Log form data contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    return formData;
  }
}

export default new ApiService();

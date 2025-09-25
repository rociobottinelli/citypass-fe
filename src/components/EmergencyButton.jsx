import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { emergencyServices, emergencyTypes } from '@/data/emergencyServices';
import { AlertTriangle, Phone, MapPin, Clock, Shield, Heart, Flame, Car, User, Home, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import EmergencyHistory from '@/components/EmergencyHistory';

const EmergencyButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [location, setLocation] = useState(null);
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Load user's emergency history
  useEffect(() => {
    const loadEmergencyHistory = async () => {
      try {
        const emergencies = await apiService.getEmergencies();
        console.log('Emergency history from API:', emergencies);
        
        // Map API data to frontend format
        const mappedEmergencies = emergencies.map(emergency => {
          // Handle location based on the actual API structure
          let ubicacion = 'Ubicación no disponible';
          if (emergency.ubicacion) {
            if (typeof emergency.ubicacion === 'string') {
              ubicacion = emergency.ubicacion;
            } else if (emergency.ubicacion.direccion) {
              ubicacion = emergency.ubicacion.direccion;
            } else if (emergency.ubicacion.address) {
              ubicacion = emergency.ubicacion.address;
            } else if (emergency.ubicacion.nombre) {
              ubicacion = emergency.ubicacion.nombre;
            } else if (emergency.ubicacion.descripcion) {
              ubicacion = emergency.ubicacion.descripcion;
            } else if (emergency.ubicacion.texto) {
              ubicacion = emergency.ubicacion.texto;
            } else if (emergency.ubicacion.lat && emergency.ubicacion.lon) {
              const lat = emergency.ubicacion.lat.toFixed(6);
              const lon = emergency.ubicacion.lon.toFixed(6);
              ubicacion = `${lat}, ${lon}`;
            } else {
              ubicacion = 'Ubicación no disponible';
            }
          } else {
            ubicacion = 'Ubicación no disponible';
          }
          
          return {
            id: emergency._id,
            timestamp: new Date(emergency.timestamp || emergency.createdAt),
            tipo: emergency.tipoEmergencia,
            ubicacion: ubicacion,
            estado: emergency.estado,
            servicios: getServicesFromType(emergency.tipoEmergencia),
            detalles: emergency.descripcion || 'Sin descripción',
            prioridad: emergency.prioridad,
            coordenadas: emergency.ubicacion?.lat && emergency.ubicacion?.lon 
              ? { lat: emergency.ubicacion.lat, lng: emergency.ubicacion.lon }
              : null,
            origen: emergency.origen
          };
        });
        
        setEmergencyHistory(mappedEmergencies);
      } catch (error) {
        console.error('Error loading emergency history:', error);
        // Fallback to empty array on error
        setEmergencyHistory([]);
      }
    };

    if (user) {
      loadEmergencyHistory();
    }
  }, [user]);

  // Helper function to get services from emergency type
  const getServicesFromType = (tipoEmergencia) => {
    const serviceMapping = {
      'Accidente': ['Ambulancia', 'Policía', 'Bomberos'],
      'Incendio': ['Bomberos', 'Ambulancia', 'Policía'],
      'Robo/Violencia': ['Policía', 'Ambulancia'],
      'ViolenciaFamiliar': ['Policía', 'Psicólogo', 'Ambulancia'],
      'Salud': ['Ambulancia', 'Psicólogo'],
      'Otro': ['Ambulancia', 'Policía']
    };
    return serviceMapping[tipoEmergencia] || ['Ambulancia', 'Policía'];
  }

  // Countdown timer
  useEffect(() => {
    let interval;
    if (isEmergency && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isEmergency) {
      // Emergency confirmed - dispatch services
      dispatchEmergency();
    }
    return () => clearInterval(interval);
  }, [isEmergency, countdown]);

  const handleEmergencyPress = () => {
    if (!isEmergency) {
      // Direct emergency - immediate activation
      setIsEmergency(true);
      setCountdown(5); // 5 second countdown
      setSelectedServices(['Ambulancia', 'Policía']); // Default services
      setSelectedType('emergencia_general'); // Default type
    } else {
      // Cancel emergency
      setIsEmergency(false);
      setCountdown(0);
      setSelectedServices([]);
      setSelectedType(null);
    }
  };

  const handleDetailedEmergency = () => {
    setShowServiceSelection(true);
  };

  const handleCloseDialog = () => {
    setShowServiceSelection(false);
    setSelectedType(null);
    setSelectedServices([]);
    setEmergencyDetails('');
    setAttachments([]);
  };

  const handleServiceSelection = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleTypeSelection = (typeId) => {
    setSelectedType(typeId);
    const type = emergencyTypes.find(t => t.id === typeId);
    if (type) {
      setSelectedServices(type.services);
    }
  };

  const confirmEmergency = () => {
    if (selectedServices.length === 0) {
      alert('Por favor selecciona al menos un servicio de emergencia');
      return;
    }
    
    setShowServiceSelection(false);
    setIsEmergency(true);
    setCountdown(5); // 5 second countdown
  };

  const dispatchEmergency = async () => {
    if (!user || !user.token) {
      alert('Error: Usuario no autenticado');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let emergencyData;
      
      if (selectedType === 'emergencia_general') {
        // Direct button emergency
        emergencyData = apiService.createButtonEmergencyData(user.id, location);
        const response = await apiService.createEmergency(emergencyData);
        console.log('Emergency created:', response);
      } else {
        // Detailed form emergency
        const formData = apiService.createFormEmergencyData(
          user.id,
          selectedType,
          emergencyDetails,
          location,
          attachments
        );
        const response = await apiService.createEmergencyWithForm(formData);
        console.log('Emergency created:', response);
      }
      
    const emergency = {
      id: Date.now(),
      timestamp: new Date(),
      servicios: selectedServices,
      tipo: selectedType,
      ubicacion: location ? `${location.lat}, ${location.lng}` : 'Ubicación no disponible',
      estado: 'Pendiente',
      detalles: emergencyDetails || 'Emergencia reportada desde botón antipánico',
      prioridad: 'Media',
      origen: 'Boton'
    };
    
    setEmergencyHistory(prev => [emergency, ...prev]);
    
    // Show success message
    console.log('Emergency created successfully, showing success message');
    setShowSuccessMessage(true);
    
    // Reset after dispatch and redirect
    setTimeout(() => {
      console.log('Redirecting to dashboard');
      setIsEmergency(false);
      setCountdown(0);
      setSelectedServices([]);
      setSelectedType(null);
      setEmergencyDetails('');
      setAttachments([]);
      setShowSuccessMessage(false);
      
      // Redirect to user dashboard
      navigate('/ciudadano/dashboard');
    }, 3000);
    
    } catch (error) {
      console.error('Error creating emergency:', error);
      alert(`Error al enviar emergencia: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceIcon = (serviceId) => {
    const icons = {
      ambulancia: <Heart className="w-5 h-5" />,
      policia: <Shield className="w-5 h-5" />,
      bomberos: <Flame className="w-5 h-5" />,
      rescatistas: <Car className="w-5 h-5" />,
      defensa_civil: <Home className="w-5 h-5" />,
      psicologo: <User className="w-5 h-5" />
    };
    return icons[serviceId] || <AlertTriangle className="w-5 h-5" />;
  };

  const getTypeIcon = (typeId) => {
    const icons = {
      accidente: <Car className="w-4 h-4" />,
      incendio: <Flame className="w-4 h-4" />,
      asalto: <Shield className="w-4 h-4" />,
      emergencia_medica: <Heart className="w-4 h-4" />,
      desastre_natural: <Home className="w-4 h-4" />,
      rescate: <Car className="w-4 h-4" />,
      violencia_domestica: <User className="w-4 h-4" />,
      otro: <AlertTriangle className="w-4 h-4" />
    };
    return icons[typeId] || <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            🚨 Botón Antipánico
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 px-4">
            Servicio de emergencias para ciudadanos
          </p>
        </div>

        {/* Main Emergency Button */}
        <div className="flex justify-center mb-4 sm:mb-8">
          <Button
            onClick={handleEmergencyPress}
            className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full text-2xl sm:text-4xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation ${
              isEmergency
                ? 'bg-red-600 hover:bg-red-700 animate-pulse shadow-2xl'
                : 'bg-red-500 hover:bg-red-600 shadow-xl'
            }`}
          >
            {isEmergency ? (
              <div className="text-center px-2">
                <div className="text-4xl sm:text-6xl mb-1 sm:mb-2">🚨</div>
                <div className="text-lg sm:text-2xl">CANCELAR</div>
                <div className="text-sm sm:text-lg">({countdown}s)</div>
              </div>
            ) : (
              <div className="text-center px-2">
                <div className="text-4xl sm:text-6xl mb-1 sm:mb-2">🚨</div>
                <div className="text-lg sm:text-2xl">EMERGENCIA</div>
              </div>
            )}
          </Button>
        </div>

        {/* Emergency Options */}
        {!isEmergency && (
          <div className="flex justify-center mb-4 sm:mb-6">
            <Button
              onClick={handleDetailedEmergency}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Formulario Emergencia
            </Button>
          </div>
        )}

        {/* Emergency Status */}
        {isEmergency && (
          <Alert className="mb-4 sm:mb-6 border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-800 text-sm sm:text-base">
              <strong>¡EMERGENCIA ACTIVADA!</strong> Los servicios de emergencia están siendo notificados con tu ubicación. 
            </AlertDescription>
          </Alert>
        )}

        {/* Location Status */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {location ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm sm:text-base">Ubicación detectada correctamente</span>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-xs sm:text-sm text-green-800">
                    <div className="font-medium mb-1">Coordenadas GPS:</div>
                    <div className="font-mono text-xs break-all">
                      Lat: {location.lat.toFixed(6)}
                    </div>
                    <div className="font-mono text-xs break-all">
                      Lng: {location.lng.toFixed(6)}
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-700 border-green-300 hover:bg-green-100 w-full sm:w-auto"
                      onClick={() => {
                        const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
                        window.open(mapsUrl, '_blank');
                      }}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="text-xs sm:text-sm">Ver en Google Maps</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm sm:text-base">Detectando ubicación...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency History */}
        <EmergencyHistory
          emergencies={emergencyHistory}
          loading={false}
          onCancelEmergency={null}
          onReportEmergency={null}
          showReportButton={false}
          title="Historial de Emergencias"
          description="Tus emergencias reportadas recientemente"
        />

        {/* Service Selection Dialog */}
        <Dialog open={showServiceSelection} onOpenChange={setShowServiceSelection}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Seleccionar Servicios de Emergencia</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Selecciona el tipo de emergencia y los servicios que necesitas
              </DialogDescription>
            </DialogHeader>

            {/* Emergency Type Selection */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Tipo de Emergencia</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {emergencyTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    onClick={() => handleTypeSelection(type.id)}
                    className={`h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-sm sm:text-base ${
                      selectedType === type.id 
                        ? 'bg-brand-primary text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl">{getTypeIcon(type.id)}</div>
                    <div className="text-xs sm:text-sm font-medium text-center">{type.name}</div>
                    <div className="text-xs text-center opacity-75 hidden sm:block">{type.description}</div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Servicios de Emergencia</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {emergencyServices.map((service) => (
                  <Button
                    key={service.id}
                    variant={selectedServices.includes(service.id) ? "default" : "outline"}
                    onClick={() => handleServiceSelection(service.id)}
                    className={`h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-sm sm:text-base ${
                      selectedServices.includes(service.id) 
                        ? `${service.color} text-white` 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl">{service.icon}</div>
                    <div className="text-xs sm:text-sm font-medium text-center">{service.name}</div>
                    <div className="text-xs text-center opacity-75 hidden sm:block">{service.description}</div>
                    <div className="text-xs opacity-75">Tiempo: {service.responseTime}</div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Emergency Details */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Detalles Adicionales (Opcional)</h3>
              <textarea
                value={emergencyDetails}
                onChange={(e) => setEmergencyDetails(e.target.value)}
                placeholder="Describe brevemente la situación de emergencia..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm sm:text-base"
                rows={3}
              />
            </div>

            {/* File Attachments */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Adjuntar Archivos (Opcional)</h3>
              <div className="space-y-3">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => setAttachments(Array.from(e.target.files))}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500">
                  Tipos permitidos: imágenes, videos, audio. Máximo 5 archivos.
                </p>
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Archivos seleccionados:</p>
                    <div className="space-y-1">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1 order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmEmergency}
                className="flex-1 bg-red-500 hover:bg-red-600 order-1 sm:order-2"
                disabled={selectedServices.length === 0}
              >
                Confirmar Emergencia
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Message Modal */}
        {console.log('showSuccessMessage:', showSuccessMessage)}
        {showSuccessMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ¡Emergencia Creada Exitosamente!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  El operador ha sido notificado y los servicios de emergencia están en camino.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => {
                      setShowSuccessMessage(false);
                      navigate('/ciudadano/dashboard');
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Ir al Panel
              </Button>
              <Button 
                variant="outline" 
                    onClick={() => setShowSuccessMessage(false)}
                    className="flex-1"
              >
                    Cerrar
              </Button>
                </div>
              </div>
            </div>
        </div>
        )}

      </div>
    </div>
  );
};

export default EmergencyButton;

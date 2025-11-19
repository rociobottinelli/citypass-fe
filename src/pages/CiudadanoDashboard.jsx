import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import apiService from '@/services/api'
import EmergencyHistory from '@/components/EmergencyHistory'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin,
  Phone,
  Shield,
  Heart,
  Flame,
  User,
  Plus,
  History,
  Settings
} from 'lucide-react'

function CiudadanoDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [myEmergencies, setMyEmergencies] = useState([])
  const [loading, setLoading] = useState(true)


  // Load user's emergencies from API
  useEffect(() => {
    const loadMyEmergencies = async () => {
      try {
        const emergencies = await apiService.getEmergencies();
        console.log('User emergencies from API:', emergencies);
        
        const mappedEmergencies = emergencies.map(emergency => {
          console.log('Emergency ubicacion structure:', emergency.ubicacion);
          
          let ubicacion = 'Ubicación no disponible';
          if (emergency.ubicacion) {
            if (emergency.ubicacion.lat && emergency.ubicacion.lon) {
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
        
        console.log('Mapped user emergencies:', mappedEmergencies);
        setMyEmergencies(mappedEmergencies);
      } catch (error) {
        console.error('Error loading emergencies:', error);
        // Fallback to mock data
        const mockEmergencies = [
          {
            id: 1,
            timestamp: new Date(Date.now() - 2 * 3600000),
            tipo: 'Accidente de Tránsito',
            ubicacion: 'Av. Principal 123',
            estado: 'En Tratamiento',
            servicios: ['Ambulancia', 'Policía'],
            detalles: 'Accidente entre dos vehículos, heridos leves',
            prioridad: 'Alta',
            coordenadas: { lat: -34.6037, lng: -58.3816 }
          }
        ];
        setMyEmergencies(mockEmergencies);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      loadMyEmergencies();
    } else {
      setLoading(false);
    }
  }, [user?.token])

  // Helper function to map emergency type to services
  const getServicesFromType = (tipoEmergencia) => {
    const serviceMapping = {
      'Accidente': ['Ambulancia', 'Policía', 'Bomberos'],
      'Incendio': ['Bomberos', 'Ambulancia', 'Policía'],
      'Robo/Violencia': ['Policía', 'Ambulancia'],
      'ViolenciaFamiliar': ['Policía', 'Psicólogo', 'Ambulancia'],
      'Inundación': ['Defensa Civil', 'Rescatistas', 'Bomberos'],
      'Salud': ['Ambulancia', 'Psicólogo'],
      'Otro': ['Ambulancia', 'Policía']
    };
    return serviceMapping[tipoEmergencia] || ['Ambulancia', 'Policía'];
  }


  const cancelEmergency = async (emergencyId) => {
    try {
      await apiService.updateEmergencyStatus(emergencyId, 'Cancelada');
      setMyEmergencies(prev => 
        prev.map(emergency => 
          emergency.id === emergencyId 
            ? { ...emergency, estado: 'Cancelada' }
            : emergency
        )
      )
    } catch (error) {
      console.error('Error canceling emergency:', error);
      alert(`Error al cancelar emergencia: ${error.message}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando tus emergencias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">
              Mi Panel de Emergencias
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground">
              Bienvenido, {user?.name} - Gestiona tus emergencias
            </p>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white w-full sm:w-auto"
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <Card className="border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer w-full max-w-sm" onClick={() => navigate('/ciudadano/emergency')}>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl sm:text-6xl mb-4">🚨</div>
              <CardTitle className="text-red-700 text-lg sm:text-xl mb-2">Botón Antipánico</CardTitle>
              <CardDescription className="text-red-600 text-sm sm:text-base">
                Emergencia inmediata con ubicación
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-3xl mx-auto">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700 text-base sm:text-lg">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                Total Emergencias
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-blue-800">{myEmergencies.length}</div>
              <p className="text-xs sm:text-sm text-blue-600">Reportadas por ti</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700 text-base sm:text-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Resueltas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-green-800">
                {myEmergencies.filter(e => e.estado === 'Resuelta').length}
              </div>
              <p className="text-xs sm:text-sm text-green-600">Completadas</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-700 text-base sm:text-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                Activas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-800">
                {myEmergencies.filter(e => e.estado === 'En Tratamiento' || e.estado === 'Pendiente').length}
              </div>
              <p className="text-xs sm:text-sm text-yellow-600">En proceso</p>
            </CardContent>
          </Card>
        </div>

        {/* My Emergencies */}
        <EmergencyHistory
          emergencies={myEmergencies}
          loading={loading}
          onCancelEmergency={cancelEmergency}
          onReportEmergency={() => navigate('/ciudadano/emergency')}
          showReportButton={true}
          title="Mis Emergencias"
          description="Historial de emergencias que has reportado"
        />

        {/* Emergency Flow Info */}
        <Card className="mt-6 sm:mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Tipos de Emergencia</CardTitle>
            <CardDescription>
              Dos formas de reportar emergencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">🚨</div>
                  <div>
                    <h3 className="font-semibold text-red-800">Emergencia Inmediata</h3>
                    <p className="text-sm text-red-600">Botón antipánico directo</p>
                  </div>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Se activa con un solo toque</li>
                  <li>• Envía ubicación automáticamente</li>
                  <li>• Notifica a Ambulancia y Policía</li>
                  <li>• Ideal para situaciones críticas</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">📋</div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Emergencia Detallada</h3>
                    <p className="text-sm text-blue-600">Formulario completo</p>
                  </div>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Selección de servicios específicos</li>
                  <li>• Descripción de la situación</li>
                  <li>• Tipo de emergencia</li>
                  <li>• Ideal para emergencias específicas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Services Info */}
        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Servicios de Emergencia</CardTitle>
            <CardDescription>
              Información sobre los servicios disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <Heart className="w-6 h-6 text-red-500" />
                <div>
                  <div className="font-medium text-sm">Ambulancia</div>
                  <div className="text-xs text-muted-foreground">Emergencias médicas</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Shield className="w-6 h-6 text-blue-500" />
                <div>
                  <div className="font-medium text-sm">Policía</div>
                  <div className="text-xs text-muted-foreground">Seguridad y orden</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Flame className="w-6 h-6 text-orange-500" />
                <div>
                  <div className="font-medium text-sm">Bomberos</div>
                  <div className="text-xs text-muted-foreground">Incendios y rescates</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Phone className="w-6 h-6 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Rescatistas</div>
                  <div className="text-xs text-muted-foreground">Rescate especializado</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="w-6 h-6 text-purple-500" />
                <div>
                  <div className="font-medium text-sm">Defensa Civil</div>
                  <div className="text-xs text-muted-foreground">Desastres naturales</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                <User className="w-6 h-6 text-pink-500" />
                <div>
                  <div className="font-medium text-sm">Psicólogo</div>
                  <div className="text-xs text-muted-foreground">Apoyo psicológico</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Contact */}
        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Contacto de Emergencia</CardTitle>
            <CardDescription>
              Números de emergencia importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.open('tel:911')}
              >
                <Phone className="w-6 h-6 text-red-500" />
                <span className="font-medium">911</span>
                <span className="text-xs text-muted-foreground">Emergencias Generales</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.open('tel:107')}
              >
                <Heart className="w-6 h-6 text-red-500" />
                <span className="font-medium">107</span>
                <span className="text-xs text-muted-foreground">Emergencias Médicas</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.open('tel:100')}
              >
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="font-medium">100</span>
                <span className="text-xs text-muted-foreground">Bomberos</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CiudadanoDashboard

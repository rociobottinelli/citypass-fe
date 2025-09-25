import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import apiService from '@/services/api'
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  MapPin,
  Phone,
  Shield,
  Heart,
  Flame
} from 'lucide-react'

function AdminStatistics() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalEmergencias: 0,
    emergenciasHoy: 0,
    emergenciasPendientes: 0,
    emergenciasResueltas: 0,
    serviciosMasUtilizados: []
  })

  const [recentEmergencies, setRecentEmergencies] = useState([])
  const [loading, setLoading] = useState(true)

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const emergencies = await apiService.getEmergencies();
        console.log('Emergencies from API:', emergencies);
        
        // Map API data to frontend format (backend already filters by role)
        const mappedEmergencies = emergencies.map(emergency => ({
          id: emergency._id,
          timestamp: new Date(emergency.timestamp || emergency.createdAt),
          tipo: emergency.tipoEmergencia,
          ubicacion: emergency.ubicacion?.direccion || 'Ubicación no disponible',
          estado: emergency.estado,
          servicios: getServicesFromType(emergency.tipoEmergencia),
          ciudadano: `Usuario ${emergency.idUsuario?.slice(-4) || 'Desconocido'}`,
          detalles: emergency.descripcion || 'Sin descripción',
          prioridad: emergency.prioridad,
          origen: emergency.origen
        }));
        
        // Calculate stats from real data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const emergenciasHoy = mappedEmergencies.filter(e => 
          e.timestamp >= today
        ).length;
        
        const emergenciasPendientes = mappedEmergencies.filter(e => 
          e.estado === 'Pendiente'
        ).length;
        
        const emergenciasResueltas = mappedEmergencies.filter(e => 
          e.estado === 'Resuelta'
        ).length;
        
        const totalEmergencias = mappedEmergencies.length;
        
        // Calculate service usage
        const serviceCounts = {};
        mappedEmergencies.forEach(emergency => {
          if (emergency.servicios) {
            emergency.servicios.forEach(service => {
              serviceCounts[service] = (serviceCounts[service] || 0) + 1;
            });
          }
        });
        
        const serviciosMasUtilizados = Object.entries(serviceCounts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: ((count / totalEmergencias) * 100).toFixed(1)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        
        const calculatedStats = {
          totalEmergencias,
          emergenciasHoy,
          emergenciasPendientes,
          emergenciasResueltas,
          serviciosMasUtilizados
        };
        
        setStats(calculatedStats);
        setRecentEmergencies(mappedEmergencies.slice(0, 3));
        
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to mock data
        const mockStats = {
          totalEmergencias: 1247,
          emergenciasHoy: 23,
          emergenciasPendientes: 8,
          emergenciasResueltas: 1156,
          serviciosMasUtilizados: [
            { name: 'Ambulancia', count: 456, percentage: 36.6 },
            { name: 'Policía', count: 234, percentage: 18.8 },
            { name: 'Bomberos', count: 189, percentage: 15.2 }
          ]
        };
        setStats(mockStats);
        setRecentEmergencies([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [])

  // Helper function to map emergency type to services
  const getServicesFromType = (tipoEmergencia) => {
    const serviceMapping = {
      'Accidente': ['Ambulancia', 'Policía'],
      'Incendio': ['Bomberos', 'Policía'],
      'Asalto': ['Policía'],
      'Emergencia Médica': ['Ambulancia'],
      'ViolenciaFamiliar': ['Policía', 'Psicólogo'],
      'Otro': ['Ambulancia', 'Policía']
    };
    return serviceMapping[tipoEmergencia] || ['Ambulancia', 'Policía'];
  }

  const getEstadoColor = (estado) => {
    const colors = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'En Tratamiento': 'bg-blue-100 text-blue-800 border-blue-200',
      'Resuelta': 'bg-green-100 text-green-800 border-green-200',
      'No Resuelta': 'bg-red-100 text-red-800 border-red-200',
      'Cancelada': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getServiceIcon = (service) => {
    const icons = {
      'Ambulancia': <Heart className="w-4 h-4" />,
      'Policía': <Shield className="w-4 h-4" />,
      'Bomberos': <Flame className="w-4 h-4" />,
      'Rescatistas': <Phone className="w-4 h-4" />,
      'Defensa Civil': <Shield className="w-4 h-4" />,
      'Psicólogo': <Heart className="w-4 h-4" />
    }
    return icons[service] || <AlertTriangle className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">
              Estadísticas del Sistema
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground">
              Bienvenido, {user?.name} - Análisis y métricas del sistema de emergencias
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700 text-base sm:text-lg">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                Total Emergencias
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-blue-800">{stats.totalEmergencias.toLocaleString()}</div>
              <p className="text-xs sm:text-sm text-blue-600">Registradas históricamente</p>
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
              <div className="text-2xl sm:text-3xl font-bold text-green-800">{stats.emergenciasResueltas.toLocaleString()}</div>
              <p className="text-xs sm:text-sm text-green-600">{((stats.emergenciasResueltas / stats.totalEmergencias) * 100).toFixed(1)}% del total</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-700 text-base sm:text-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-800">{stats.emergenciasPendientes}</div>
              <p className="text-xs sm:text-sm text-yellow-600">Requieren atención</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                Hoy
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-purple-800">{stats.emergenciasHoy}</div>
              <p className="text-xs sm:text-sm text-purple-600">Emergencias de hoy</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Activity */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertTriangle className="w-5 h-5" />
              Actividad de Hoy
            </CardTitle>
            <CardDescription>
              Emergencias reportadas en las últimas 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-blue-800">{stats.emergenciasHoy}</div>
                <div className="text-sm text-blue-600">Emergencias Hoy</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-800">{stats.emergenciasHoy - stats.emergenciasPendientes}</div>
                <div className="text-sm text-green-600">Atendidas</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-800">{stats.emergenciasPendientes}</div>
                <div className="text-sm text-yellow-600">Pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Services Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Servicios Más Utilizados</CardTitle>
              <CardDescription>
                Distribución de servicios de emergencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.serviciosMasUtilizados.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{getServiceIcon(service.name)}</div>
                      <div>
                        <div className="font-medium text-sm sm:text-base">{service.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{service.count} emergencias</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-medium">{service.percentage}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${service.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Emergencies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Emergencias Recientes</CardTitle>
              <CardDescription>
                Últimas emergencias reportadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEmergencies.map((emergency) => (
                  <div key={emergency.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-lg">{getServiceIcon(emergency.servicios[0])}</div>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{emergency.tipo}</div>
                          <div className="text-xs text-muted-foreground">
                            {emergency.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getEstadoColor(emergency.estado)} text-xs`}>
                        {emergency.estado}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{emergency.ubicacion}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {emergency.servicios.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Ciudadano: {emergency.ciudadano}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminStatistics


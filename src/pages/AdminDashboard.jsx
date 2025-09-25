import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
  Flame,
  User,
  Eye,
  Edit,
  Filter,
  Search,
  Image,
  Download,
  Zap
} from 'lucide-react'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalEmergencias: 0,
    emergenciasHoy: 0,
    emergenciasPendientes: 0,
    emergenciasResueltas: 0,
    serviciosMasUtilizados: []
  })

  const [emergencies, setEmergencies] = useState([])
  const [filteredEmergencies, setFilteredEmergencies] = useState([])
  const [selectedEmergency, setSelectedEmergency] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Load emergencies from API
  useEffect(() => {
    const loadEmergencies = async () => {
      try {
        const emergencies = await apiService.getEmergencies();
        console.log('Emergencies from API:', emergencies);
        
        // Map API data to frontend format (backend already filters by role)
        const mappedEmergencies = emergencies.map(emergency => {
          console.log('Emergency ubicacion structure:', emergency.ubicacion);
          
          // Handle location based on the actual API structure
          let ubicacion = 'Ubicación no disponible';
          let coordenadas = null;
          
          if (emergency.ubicacion) {
            if (emergency.ubicacion.lat && emergency.ubicacion.lon) {
              // If coordinates are available, show them with precision
              const lat = emergency.ubicacion.lat.toFixed(6);
              const lon = emergency.ubicacion.lon.toFixed(6);
              ubicacion = `${lat}, ${lon}`;
              coordenadas = { lat: emergency.ubicacion.lat, lng: emergency.ubicacion.lon };
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
            ubicacion,
            coordenadas,
            estado: emergency.estado,
            servicios: getServicesFromType(emergency.tipoEmergencia),
            ciudadano: `Usuario ${emergency.idUsuario?.slice(-4) || 'Desconocido'}`,
            telefono: 'No disponible',
            detalles: emergency.descripcion || 'Sin descripción',
            prioridad: emergency.prioridad,
            origen: emergency.origen,
            adjuntos: emergency.adjuntos || []
          };
        });
        
        console.log('Mapped emergencies:', mappedEmergencies);
        setEmergencies(mappedEmergencies);
        setFilteredEmergencies(mappedEmergencies);
        
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
        
      } catch (error) {
        console.error('Error loading emergencies:', error);
        // Fallback to mock data
        const mockEmergencies = [
          {
            id: 1,
            timestamp: new Date(Date.now() - 15 * 60000),
            tipo: 'Accidente de Tránsito',
            ubicacion: 'Av. Principal 123',
            estado: 'Pendiente',
            servicios: ['Ambulancia', 'Policía'],
            ciudadano: 'Juan Pérez',
            telefono: '+1234567890',
            detalles: 'Accidente entre dos vehículos, heridos leves',
            prioridad: 'Alta',
            coordenadas: { lat: -34.6037, lng: -58.3816 }
          }
        ];
        setEmergencies(mockEmergencies);
        setFilteredEmergencies(mockEmergencies);
        
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
      } finally {
        setLoading(false);
      }
    };

    loadEmergencies();
  }, [])

  // Filter and search logic
  useEffect(() => {
    let filtered = emergencies

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(emergency => emergency.estado === filter)
    }

    // Search by type, location, or citizen name
    if (searchTerm) {
      filtered = filtered.filter(emergency => 
        emergency.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emergency.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emergency.ciudadano.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEmergencies(filtered)
    
    // Calculate total pages
    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    setTotalPages(totalPages)
    
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [emergencies, filter, searchTerm, itemsPerPage])

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

  const getPrioridadColor = (prioridad) => {
    const colors = {
      'Crítica': 'bg-red-100 text-red-800 border-red-200',
      'Alta': 'bg-orange-100 text-orange-800 border-orange-200',
      'Media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Baja': 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[prioridad] || 'bg-gray-100 text-gray-800 border-gray-200'
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

  const updateEmergencyStatus = async (emergencyId, newStatus) => {
    try {
      console.log(`Updating emergency ${emergencyId} status to: ${newStatus}`);
      
      const response = await apiService.updateEmergencyStatus(emergencyId, newStatus);
      console.log('API response:', response);
      
      setEmergencies(prev => 
        prev.map(emergency => 
          emergency.id === emergencyId 
            ? { ...emergency, estado: newStatus }
            : emergency
        )
      )
      setFilteredEmergencies(prev => 
        prev.map(emergency => 
          emergency.id === emergencyId 
            ? { ...emergency, estado: newStatus }
            : emergency
        )
      )
      console.log(`Emergency ${emergencyId} status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating emergency status:', error);
      alert(`Error al actualizar estado: ${error.message}`);
    }
  }

  // Pagination functions
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredEmergencies.slice(startIndex, endIndex)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 60) {
      return `Hace ${minutes} min`
    } else if (hours < 24) {
      return `Hace ${hours}h`
    } else {
      return timestamp.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
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
              Dashboard Administrativo
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground">
              Bienvenido, {user?.name} - Panel de control del sistema de emergencias
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

        {/* Dashboard Content */}
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-yellow-700 text-base sm:text-lg">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    Pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-800">
                    {emergencies.filter(e => e.estado === 'Pendiente').length}
                  </div>
                  <p className="text-xs sm:text-sm text-yellow-600">Requieren atención</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-700 text-base sm:text-lg">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                    En Tratamiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-800">
                    {emergencies.filter(e => e.estado === 'En Tratamiento').length}
                  </div>
                  <p className="text-xs sm:text-sm text-blue-600">Activas</p>
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
                    {emergencies.filter(e => e.estado === 'Resuelta').length}
                  </div>
                  <p className="text-xs sm:text-sm text-green-600">Completadas</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-700 text-base sm:text-lg">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    Críticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-red-800">
                    {emergencies.filter(e => e.prioridad === 'High' && e.estado !== 'Cancelada' && e.estado !== 'Resuelta').length}
                  </div>
                  <p className="text-xs sm:text-sm text-red-600">Alta prioridad</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-700 text-base sm:text-lg">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Canceladas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {emergencies.filter(e => e.estado === 'Cancelada').length}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Emergencias canceladas</p>
                </CardContent>
              </Card>
            </div>

            {/* Latest Emergency Alert */}
            {emergencies.length > 0 && (
              <Card className="mb-6 sm:mb-8 border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-700 text-lg sm:text-xl">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                    Última Emergencia Ingresada
                    <Badge className="bg-red-500 text-white text-xs animate-bounce">
                      NUEVA
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const latestEmergency = emergencies
                      .filter(e => e.coordenadas && e.coordenadas.lat && e.coordenadas.lng)
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
                    
                    if (!latestEmergency) return null
                    
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Emergency Info */}
                        <div className="lg:col-span-2 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div className="text-2xl">{getServiceIcon(latestEmergency.servicios[0])}</div>
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">{latestEmergency.tipo}</h3>
                                <p className="text-sm text-gray-600">
                                  {getTimeAgo(latestEmergency.timestamp)} • {latestEmergency.ciudadano}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={`${getPrioridadColor(latestEmergency.prioridad)} text-xs font-semibold`}>
                                {latestEmergency.prioridad}
                              </Badge>
                              <Badge className={`${getEstadoColor(latestEmergency.estado)} text-xs`}>
                                {latestEmergency.estado}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-red-500" />
                            {(() => {
                              console.log('Latest emergency ubicacion:', latestEmergency.ubicacion);
                              const isCoordinates = latestEmergency.ubicacion && 
                                latestEmergency.ubicacion.includes(',') && 
                                !latestEmergency.ubicacion.includes('Ubicación') && 
                                !latestEmergency.ubicacion.includes('no disponible');
                              console.log('Is coordinates:', isCoordinates);
                              return isCoordinates;
                            })() ? (
                              <button
                                onClick={() => {
                                  const [lat, lon] = latestEmergency.ubicacion.split(', ');
                                  const googleMapsUrl = `https://maps.google.com/?q=${lat.trim()},${lon.trim()}`;
                                  console.log('Opening Google Maps:', googleMapsUrl);
                                  window.open(googleMapsUrl, '_blank');
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded underline cursor-pointer transition-colors font-medium"
                                title="Click para abrir en Google Maps"
                              >
                                {latestEmergency.ubicacion}
                              </button>
                            ) : (
                              <span className="font-medium">{latestEmergency.ubicacion}</span>
                            )}
                          </div>
                          
                          {latestEmergency.detalles && (
                            <div className="bg-white/70 p-3 rounded-lg border border-red-200">
                              <p className="text-sm text-gray-700">
                                <strong>Detalles:</strong> {latestEmergency.detalles}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-1">
                            {latestEmergency.servicios.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-white/70 border-red-200">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                                size="sm"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalles Completos
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-red-500" />
                                  Emergencia #{latestEmergency.id}
                                </DialogTitle>
                                <DialogDescription>
                                  Información completa de la última emergencia ingresada
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Tipo</label>
                                    <p className="text-sm font-semibold">{latestEmergency.tipo}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Estado</label>
                                    <p className="text-sm">{latestEmergency.estado}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Prioridad</label>
                                    <p className="text-sm">{latestEmergency.prioridad}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Fecha</label>
                                    <p className="text-sm">{latestEmergency.timestamp.toLocaleString()}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Ubicación</label>
                                  {(() => {
                                    const isCoordinates = latestEmergency.ubicacion && 
                                      latestEmergency.ubicacion.includes(',') && 
                                      !latestEmergency.ubicacion.includes('Ubicación') && 
                                      !latestEmergency.ubicacion.includes('no disponible');
                                    return isCoordinates;
                                  })() ? (
                                    <button
                                      onClick={() => {
                                        const [lat, lon] = latestEmergency.ubicacion.split(', ');
                                        const googleMapsUrl = `https://maps.google.com/?q=${lat.trim()},${lon.trim()}`;
                                        window.open(googleMapsUrl, '_blank');
                                      }}
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded underline cursor-pointer transition-colors text-sm"
                                      title="Click para abrir en Google Maps"
                                    >
                                      {latestEmergency.ubicacion}
                                    </button>
                                  ) : (
                                    <p className="text-sm">{latestEmergency.ubicacion}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Ciudadano</label>
                                  <p className="text-sm">{latestEmergency.ciudadano} - {latestEmergency.telefono}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Servicios</label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {latestEmergency.servicios.map((service, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                {latestEmergency.detalles && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Detalles</label>
                                    <p className="text-sm bg-gray-50 p-2 rounded">{latestEmergency.detalles}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Filters and Search */}
            <Card className="mb-6 sm:mb-8">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Filtros y Búsqueda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar por tipo, ubicación o ciudadano..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filter === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilter('all')}
                      className="text-xs sm:text-sm"
                    >
                      Todas
                    </Button>
                    <Button
                      variant={filter === 'Pendiente' ? 'default' : 'outline'}
                      onClick={() => setFilter('Pendiente')}
                      className="text-xs sm:text-sm"
                    >
                      Pendientes
                    </Button>
                    <Button
                      variant={filter === 'En Tratamiento' ? 'default' : 'outline'}
                      onClick={() => setFilter('En Tratamiento')}
                      className="text-xs sm:text-sm"
                    >
                      En Tratamiento
                    </Button>
                    <Button
                      variant={filter === 'Resuelta' ? 'default' : 'outline'}
                      onClick={() => setFilter('Resuelta')}
                      className="text-xs sm:text-sm"
                    >
                      Resueltas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergencies List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Emergencias ({filteredEmergencies.length})</CardTitle>
                <CardDescription>
                  Lista de emergencias filtradas por estado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEmergencies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No se encontraron emergencias con los filtros aplicados
                    </div>
                  ) : (
                    getCurrentPageData().map((emergency) => (
                      <div key={emergency.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="text-xl">{getServiceIcon(emergency.servicios[0])}</div>
                                <div>
                                  <div className="font-medium text-base sm:text-lg">{emergency.tipo}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {getTimeAgo(emergency.timestamp)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={`${getEstadoColor(emergency.estado)} text-xs`}>
                                  {emergency.estado}
                                </Badge>
                                <Badge className={`${getPrioridadColor(emergency.prioridad)} text-xs`}>
                                  {emergency.prioridad}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="w-4 h-4" />
                              {(() => {
                                console.log('Emergency ubicacion:', emergency.ubicacion);
                                const isCoordinates = emergency.ubicacion && 
                                  emergency.ubicacion.includes(',') && 
                                  !emergency.ubicacion.includes('Ubicación') && 
                                  !emergency.ubicacion.includes('no disponible');
                                console.log('Is coordinates:', isCoordinates);
                                return isCoordinates;
                              })() ? (
                                <button
                                  onClick={() => {
                                    const [lat, lon] = emergency.ubicacion.split(', ');
                                    const googleMapsUrl = `https://maps.google.com/?q=${lat.trim()},${lon.trim()}`;
                                    console.log('Opening Google Maps:', googleMapsUrl);
                                    window.open(googleMapsUrl, '_blank');
                                  }}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded underline cursor-pointer transition-colors"
                                  title="Click para abrir en Google Maps"
                                >
                                  {emergency.ubicacion}
                                </button>
                              ) : (
                                <span>{emergency.ubicacion}</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <User className="w-4 h-4" />
                              <span>{emergency.ciudadano}</span>
                              <span className="mx-1">•</span>
                              <Phone className="w-4 h-4" />
                              <span>{emergency.telefono}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {emergency.servicios.map((service, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                            
                            {emergency.detalles && (
                              <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                                <strong>Detalles:</strong> {emergency.detalles}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedEmergency(emergency)}
                                  className="w-full sm:w-auto"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver Detalles
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalles de Emergencia #{emergency.id}</DialogTitle>
                                  <DialogDescription>
                                    Información completa de la emergencia
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                                      <p className="text-sm">{emergency.tipo}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                      <p className="text-sm">{emergency.estado}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
                                      <p className="text-sm">{emergency.prioridad}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                                      <p className="text-sm">{emergency.timestamp.toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                                    {(() => {
                                      const isCoordinates = emergency.ubicacion && 
                                        emergency.ubicacion.includes(',') && 
                                        !emergency.ubicacion.includes('Ubicación') && 
                                        !emergency.ubicacion.includes('no disponible');
                                      return isCoordinates;
                                    })() ? (
                                      <button
                                        onClick={() => {
                                          const [lat, lon] = emergency.ubicacion.split(', ');
                                          const googleMapsUrl = `https://maps.google.com/?q=${lat.trim()},${lon.trim()}`;
                                          window.open(googleMapsUrl, '_blank');
                                        }}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded underline cursor-pointer transition-colors text-sm"
                                        title="Click para abrir en Google Maps"
                                      >
                                        {emergency.ubicacion}
                                      </button>
                                    ) : (
                                      <p className="text-sm">{emergency.ubicacion}</p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Ciudadano</label>
                                    <p className="text-sm">{emergency.ciudadano} - {emergency.telefono}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Servicios</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {emergency.servicios.map((service, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {service}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  {emergency.detalles && (
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Detalles</label>
                                      <p className="text-sm">{emergency.detalles}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {/* Admin Status Management */}
                            <div className="flex flex-col gap-2">
                              <select
                                value={emergency.estado}
                                onChange={(e) => updateEmergencyStatus(emergency.id, e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Tratamiento">En Tratamiento</option>
                                <option value="Resuelta">Resuelta</option>
                                <option value="No Resuelta">No Resuelta</option>
                                <option value="Cancelada">Cancelada</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Pagination */}
                  {filteredEmergencies.length > itemsPerPage && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>
                          Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredEmergencies.length)} de {filteredEmergencies.length} emergencias
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1"
                        >
                          <span>←</span>
                          Anterior
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1"
                        >
                          Siguiente
                          <span>→</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
      </div>
    </div>
  )
}

export default AdminDashboard

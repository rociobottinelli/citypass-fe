import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const EmergencyHistory = ({ 
  emergencies = [], 
  loading = false, 
  onCancelEmergency, 
  onReportEmergency,
  showReportButton = true,
  title = "Historial de Emergencias",
  description = "Historial de emergencias reportadas"
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  // Pagination logic
  const totalPages = Math.ceil(emergencies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmergencies = emergencies.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Helper functions
  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${days} días`
  }

  const getEstadoColor = (estado) => {
    const colors = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'En Tratamiento': 'bg-blue-100 text-blue-800 border-blue-200',
      'Resuelta': 'bg-green-100 text-green-800 border-green-200',
      'Cancelada': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getServiceIcon = (service) => {
    const icons = {
      'Ambulancia': '🚑',
      'Policía': '🚔',
      'Bomberos': '🚒',
      'Psicólogo': '🧠',
      'Defensa Civil': '🛡️'
    }
    return icons[service] || '🚨'
  }

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <History className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando emergencias...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <History className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {emergencies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No tienes emergencias reportadas</p>
            <p className="text-sm">Usa el botón antipánico para reportar una emergencia</p>
            {showReportButton && onReportEmergency && (
              <Button 
                className="mt-4"
                onClick={onReportEmergency}
              >
                <Plus className="w-4 h-4 mr-2" />
                Reportar Emergencia
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentEmergencies.map((emergency) => (
              <div key={emergency.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{getServiceIcon(emergency.servicios?.[0] || 'emergencia')}</div>
                        <div>
                          <div className="font-medium text-base sm:text-lg">{emergency.tipo}</div>
                          <div className="text-sm text-muted-foreground">
                            {getTimeAgo(emergency.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getEstadoColor(emergency.estado)} text-xs`}>
                        {emergency.estado}
                      </Badge>
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
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(emergency.servicios || []).map((service, index) => (
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
                    {emergency.estado === 'Pendiente' && onCancelEmergency && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => onCancelEmergency(emergency.id)}
                        className="w-full sm:w-auto"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                    
                    {emergency.estado === 'En Tratamiento' && (
                      <div className="text-center">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          Los servicios están en camino
                        </Badge>
                      </div>
                    )}
                    
                    {emergency.estado === 'Resuelta' && (
                      <div className="text-center">
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          Emergencia resuelta
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        {emergencies.length > itemsPerPage && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Mostrando {startIndex + 1}-{Math.min(endIndex, emergencies.length)} de {emergencies.length} emergencias
              </p>
            </div>
            
            {/* Mobile Pagination */}
            <div className="flex sm:hidden items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 text-xs"
              >
                <ChevronLeft className="w-3 h-3" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground px-2">
                  {currentPage} de {totalPages}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 text-xs"
              >
                Siguiente
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Desktop Pagination */}
            <div className="hidden sm:flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0 text-xs"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EmergencyHistory

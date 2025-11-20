import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { BarChart3 } from 'lucide-react'

const USE_CASES = [
  { value: 'alerta-vecinal', label: 'Alerta Vecinal' },
  { value: 'viaje-seguro', label: 'Viaje Seguro' },
  { value: 'respuesta-climatica', label: 'Respuesta Climática' },
  { value: 'plaza-viva', label: 'Plaza Viva' }
]

function AdminBI() {
  const { user, logout } = useAuth()
  const [selectedUseCase, setSelectedUseCase] = useState('plaza-viva')

  const getIframeUrl = (useCase) => {
    return `https://dashboard.marianogimenez.ar/${useCase}?login=false&iframe=true`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">
              Business Intelligence
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground">
              Bienvenido, {user?.name} - Tableros de análisis y estadísticas
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

        {/* Use Case Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Seleccionar Caso de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label htmlFor="useCase" className="text-sm font-medium text-foreground sm:whitespace-nowrap">
                Caso de Uso:
              </label>
              <select
                id="useCase"
                value={selectedUseCase}
                onChange={(e) => setSelectedUseCase(e.target.value)}
                className="w-full sm:w-auto min-w-[200px] p-3 border border-input bg-background rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {USE_CASES.map((useCase) => (
                  <option key={useCase.value} value={useCase.value}>
                    {useCase.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* BI Dashboard Iframe */}
        <Card>
          <CardContent className="p-0">
            <iframe
              src={getIframeUrl(selectedUseCase)}
              width="100%"
              height="800px"
              frameBorder="0"
              title={`BI Dashboard - ${USE_CASES.find(uc => uc.value === selectedUseCase)?.label}`}
              className="rounded-b-lg"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminBI


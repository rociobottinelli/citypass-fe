import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function Dashboard() {
  const handleLogout = () => {
    // Simulate logout
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              ¡Bienvenido a Citypass+!
            </h1>
            <p className="text-xl text-muted-foreground">
              Tu panel de control personal
            </p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-primary">Atracciones Visitadas</CardTitle>
              <CardDescription>Este mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-sm text-muted-foreground">+3 desde la semana pasada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-brand-secondary">Eventos Asistidos</CardTitle>
              <CardDescription>Este mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5</div>
              <p className="text-sm text-muted-foreground">+1 desde la semana pasada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-brand-dark">Puntos Acumulados</CardTitle>
              <CardDescription>Total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2,450</div>
              <p className="text-sm text-muted-foreground">+150 esta semana</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>
                Eventos recomendados para ti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Festival de Música</h4>
                    <p className="text-sm text-muted-foreground">15 de Septiembre</p>
                  </div>
                  <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90">
                    Ver Detalles
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Tour Gastronómico</h4>
                    <p className="text-sm text-muted-foreground">22 de Septiembre</p>
                  </div>
                  <Button size="sm" className="bg-brand-secondary hover:bg-brand-secondary/90">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atracciones Populares</CardTitle>
              <CardDescription>
                Descubre las atracciones más visitadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Museo de Arte</h4>
                    <p className="text-sm text-muted-foreground">4.8 ⭐ (1,234 reseñas)</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-brand-primary text-brand-primary">
                    Visitar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Parque Central</h4>
                    <p className="text-sm text-muted-foreground">4.6 ⭐ (987 reseñas)</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-brand-secondary text-brand-secondary">
                    Visitar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

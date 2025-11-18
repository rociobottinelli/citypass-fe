import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading, loadUserFromToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")

    if (token) {
      // 1. Llama a la nueva función para autenticar al usuario con el token.
      loadUserFromToken(token).then((result) => {
        if (result.success) {
          // 2. Limpia la URL y redirige SOLAMENTE si el login fue exitoso.
          window.history.replaceState({}, document.title, "/ciudadano/dashboard");
          navigate("/ciudadano/dashboard");
        } else {
          // Manejar el error si el token no funciona (opcional)
          setError(result.error || 'Error de autenticación con Google');
          window.history.replaceState({}, document.title, window.location.pathname); // Limpiar solo el token
        }
      });
      
    }
  }, [navigate, loadUserFromToken])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const result = await login(email, password)
    
    if (result.success) {
      const { user } = result;
      if (user.role === 'Admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'Operador') {
        navigate('/operador/dashboard')
      } else if (user.role === 'Ciudadano') {
        navigate('/ciudadano/dashboard')
      }
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Citypass+
          </h1>
          <p className="text-muted-foreground">
            Tu puerta de entrada a las mejores experiencias de la ciudad
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-500 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@citypass.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <p className="font-medium mb-1">Credenciales de prueba:</p>
                <p>• Admin: admin@citypass.com / 123456</p>
                <p>• Operador: operador@citypass.com / 123456</p>
                <p>• Ciudadano: ciudadano@citypass.com / 123456</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <Button
              onClick={() => {
                window.location.href = "https://citypass.duckdns.org/auth/google";
              }}
              className="w-full bg-red-600 text-white mt-4"
            >
              Continuar con Google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-brand-primary"
                >
                  Regístrate aquí
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Al continuar, aceptas nuestros{' '}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-xs text-brand-primary"
            >
              Términos de Servicio
            </Button>{' '}
            y{' '}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-xs text-brand-primary"
            >
              Política de Privacidad
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

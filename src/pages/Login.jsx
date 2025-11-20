import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
// Importaciones Toastify para notificaciones del Popup
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  // Importamos ambas funciones: la original para Google y la nueva para el Popup
  const { login, loading, loadUserFromToken, handleExternalLogin } = useAuth()
  const navigate = useNavigate()

  // 1. EFECTO ORIGINAL: Maneja el retorno de Google (?token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")

    if (token) {
      loadUserFromToken(token).then((result) => {
        if (result.success) {
          // Google suele ser para ciudadanos, redirigimos allí por defecto
          // o según el rol que devuelva el backend
          const targetPath = result.user.role === 'Admin' ? '/admin/dashboard' : '/ciudadano/dashboard';
          window.history.replaceState({}, document.title, targetPath);
          navigate(targetPath);
        } else {
          setError(result.error || 'Error de autenticación con Google');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }, [navigate, loadUserFromToken])

  // 2. NUEVO EFECTO: Maneja el mensaje del Popup (Admin SSO)
  useEffect(() => {
    const handleMessage = async (event) => {
      // if (event.origin !== "http://ec2-44-217-132-156.compute-1.amazonaws.com") return; // Descomentar en prod

      const { token: receivedToken } = event.data;
      
      if (receivedToken) {
        toast.info("Validando acceso Admin...", { autoClose: 2000 });
        
        const result = await handleExternalLogin(receivedToken);
        
        if (result.success) {
          toast.success("Acceso Admin Autorizado");
          setTimeout(() => {
            navigate('/admin/dashboard'); // Redirige directo al Dashboard Admin
          }, 1000);
        } else {
          toast.error("Error: " + result.error);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate, handleExternalLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const result = await login(email, password)
    
    if (result.success) {
      const { user } = result;
      if (user.role === 'Admin') navigate('/admin/dashboard')
      else if (user.role === 'Operador') navigate('/operador/dashboard')
      else if (user.role === 'Ciudadano') navigate('/ciudadano/dashboard')
    } else {
      setError(result.error)
    }
  }

  // Función para abrir el popup de Admin
  const handleAdminPopup = () => {
    const redirectUrl = window.location.origin;
    const loginUrl = `http://ec2-44-217-132-156.compute-1.amazonaws.com/auth?redirectUrl=${encodeURIComponent(redirectUrl)}`;
    window.open(loginUrl, "LoginPopup", "width=600,height=700");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <ToastContainer position="top-center" />

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

            {/* BOTÓN ORIGINAL DE GOOGLE RESTAURADO */}
            <Button
              onClick={() => {
                window.location.href = "https://citypass.duckdns.org/auth/google";
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white mt-4"
            >
              Continuar con Google
            </Button>

            <div className="mt-6 pt-6 border-t text-center">
               <p className="text-xs text-muted-foreground mb-3">Acceso para personal administrativo</p>
               {/* BOTÓN NUEVO PARA ADMIN SSO */}
               <Button
                onClick={handleAdminPopup}
                variant="outline"
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Ingreso Administrativo (SSO)
              </Button>
            </div>

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

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Al continuar, aceptas nuestros{' '}
            <Button type="button" variant="link" className="p-0 h-auto text-xs text-brand-primary">
              Términos de Servicio
            </Button>{' '}
            y{' '}
            <Button type="button" variant="link" className="p-0 h-auto text-xs text-brand-primary">
              Política de Privacidad
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
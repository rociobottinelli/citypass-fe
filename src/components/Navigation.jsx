import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Menu, 
  X, 
  Phone, 
  MapPin, 
  User, 
  Settings,
  Shield,
  Heart,
  Flame,
  LogOut,
  BarChart3,
  AlertTriangle,
  Zap,
  Cross
} from 'lucide-react';

// Emergency Logo Component
const EmergencyLogo = ({ size = "w-8 h-8", showText = true }) => {
  const iconSize = size === "w-8 h-8" ? "w-4 h-4" : "w-5 h-5";
  const boltSize = size === "w-8 h-8" ? "w-2 h-2" : "w-2.5 h-2.5";
  
  return (
    <div className="flex items-center gap-2">
      <div className={`${size} bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg border-2 border-red-300 relative overflow-hidden`}>
        {/* Animated pulse effect */}
        <div className="absolute inset-0 bg-red-400 rounded-xl animate-pulse opacity-30"></div>
        
        <div className="relative z-10">
          {/* Emergency cross symbol */}
          <Cross className={`${iconSize} text-white`} strokeWidth={3} />
          {/* Lightning bolt for urgency */}
          <Zap className={`${boltSize} text-yellow-300 absolute -top-0.5 -right-0.5`} fill="currentColor" />
        </div>
        
        {/* Emergency indicator dot */}
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"></div>
      </div>
      
      {showText && (
        <div className="ml-3">
          <div className="font-bold text-lg text-red-700">Citypass+</div>
          <div className="text-xs text-gray-500">Sistema de Emergencias</div>
        </div>
      )}
    </div>
  );
};

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        {
          name: 'Login',
          path: '/login',
          icon: <User className="w-4 h-4" />,
          description: 'Iniciar sesión'
        }
      ];
    }

    // Role-based navigation
    if (user?.role === 'Admin') {
      return [
        {
          name: 'Dashboard',
          path: '/admin/dashboard',
          icon: <BarChart3 className="w-4 h-4" />,
          description: 'Panel administrativo'
        },
        {
          name: 'Estadísticas',
          path: '/admin/dashboard',
          icon: <BarChart3 className="w-4 h-4" />,
          description: 'Análisis del sistema'
        }
      ];
    }

    if (user?.role === 'Operador') {
      return [
        {
          name: 'Emergencias',
          path: '/operador/dashboard',
          icon: <AlertTriangle className="w-4 h-4" />,
          description: 'Gestión de emergencias'
        },
        {
          name: 'Panel',
          path: '/operador/dashboard',
          icon: <Settings className="w-4 h-4" />,
          description: 'Panel de operador'
        }
      ];
    }

    if (user?.role === 'Ciudadano') {
      return [
        {
          name: 'Mi Panel',
          path: '/ciudadano/dashboard',
          icon: <User className="w-4 h-4" />,
          description: 'Mi panel personal'
        },
        {
          name: 'Emergencias',
          path: '/ciudadano/emergency',
          icon: <Shield className="w-4 h-4" />,
          description: 'Botón antipánico',
          isEmergency: true
        }
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  const emergencyQuickActions = [
    {
      name: 'Llamar 911',
      action: () => window.open('tel:911'),
      icon: <Phone className="w-4 h-4" />,
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      name: 'Ubicación',
      action: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const mapsUrl = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
            window.open(mapsUrl, '_blank');
          });
        }
      },
      icon: <MapPin className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between p-3">
          <Link to="/" className="flex items-center gap-2">
            <EmergencyLogo size="w-8 h-8" showText={false} />
            <span className="font-bold text-lg">Emergency+</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {/* User info on mobile */}
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {user?.role}
                </Badge>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
            )}
            
            {/* Emergency Quick Actions on Mobile */}
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => window.open('tel:911')}
            >
              <Phone className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t">
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-brand-primary text-white'
                      : 'hover:bg-gray-100'
                  } ${item.isEmergency ? 'border-l-4 border-red-500' : ''}`}
                >
                  {item.icon}
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Link>
              ))}
              
              {/* Logout button for authenticated users */}
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              )}
              
              {/* Emergency Quick Actions */}
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-gray-500 mb-2">Acciones Rápidas</div>
                <div className="grid grid-cols-2 gap-2">
                  {emergencyQuickActions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      className={`${action.color} text-white`}
                      onClick={action.action}
                    >
                      {action.icon}
                      <span className="ml-1">{action.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-40">
        <div className="p-6">
          {/* Logo */}
          <Link to="/" className="mb-12">
            <EmergencyLogo size="w-10 h-10" showText={true} />
          </Link>

          {/* User Info */}
          {isAuthenticated && (
            <div className="mb-8 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-sm">{user?.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {user?.role}
              </Badge>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="space-y-3 mt-3">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                  isActive(item.path)
                    ? 'bg-brand-primary text-white'
                    : 'hover:bg-gray-100'
                } ${item.isEmergency ? 'border-l-4 border-red-500' : ''}`}
              >
                {item.icon}
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </Link>
            ))}
            
            {/* Logout button for authenticated users */}
            {isAuthenticated && (
              <Button
                variant="outline"
                onClick={logout}
                className="w-full justify-start mt-6"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            )}
          </nav>

          {/* Emergency Quick Actions */}
          <div className="mt-8 pt-6 border-t">
            <div className="text-sm font-medium text-gray-500 mb-4">Acciones de Emergencia</div>
            <div className="space-y-2">
              {emergencyQuickActions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  className={`w-full ${action.color} text-white`}
                  onClick={action.action}
                >
                  {action.icon}
                  <span className="ml-2">{action.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Emergency Status Indicator */}
          <div className="mt-8 p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 shadow-sm">
            <div className="flex items-center gap-2 text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Sistema Activo</span>
            </div>
            <div className="text-xs text-red-600 mt-1">
              Servicios de emergencia disponibles 24/7
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-yellow-600 font-medium">Respuesta Rápida</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navigation */}
      <div className="lg:ml-64">
        {/* Content goes here */}
      </div>
    </>
  );
};

export default Navigation;

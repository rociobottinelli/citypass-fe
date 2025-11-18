import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData.token === savedToken) {
          setUser(userData);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const loadUserFromToken = async (token) => {
    setLoading(true);
    try {
      localStorage.setItem('token', token);
      const userDetails = await apiService.getUserProfileByToken(token);
      if (userDetails && userDetails.id && (userDetails.role || userDetails.rol)) {
        const user = {
          id: userDetails.id,
          email: userDetails.email,
          role: userDetails.role || userDetails.rol,
          name: userDetails.name,
          token: token // Usa el token recibido en la URL
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      } else {
        console.error('Fallo de validación del perfil:', userDetails);
        return { success: false, error: 'Respuesta de servidor incompleta o faltan datos del usuario.'+JSON.stringify(userDetails) };
      }
    } catch (error) {
      console.error('Error loading user from token:', error);
      // Limpia el token si la obtención del perfil falla
      localStorage.removeItem('token'); 
      return { success: false, error: error.message || 'Error de conexión con el servidor (al obtener perfil)' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    
    try {
      const userMapping = {
        'admin@citypass.com': { 
          id: '507f1f77bcf86cd799439011', 
          email: 'admin@citypass.com', 
          role: 'Admin', 
          name: 'Administrador' 
        },
        'operador@citypass.com': { 
          id: '507f1f77bcf86cd799439012', 
          email: 'operador@citypass.com', 
          role: 'Operador', 
          name: 'Operador' 
        },
        'ciudadano@citypass.com': { 
          id: '507f1f77bcf86cd799439022', 
          email: 'ciudadano@citypass.com', 
          role: 'Ciudadano', 
          name: 'Ciudadano' 
        }
      };

      const userInfo = userMapping[email];
      
      if (userInfo && password === '123456') {
        let tokenResponse;
        if (userInfo.role === 'Admin') {
          tokenResponse = await apiService.getTokenAdmin(userInfo.id);
        } else if (userInfo.role === 'Operador') {
          tokenResponse = await apiService.getTokenOperador(userInfo.id);
        } else if (userInfo.role === 'Ciudadano') {
          tokenResponse = await apiService.getTokenCiudadano(userInfo.id);
        }

        if (tokenResponse.token) {
          const user = { ...userInfo, token: tokenResponse.token };
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', tokenResponse.token);
          return { success: true, user };
        } else {
          return { success: false, error: 'Error al obtener token de autenticación' };
        }
      } else {
        return { success: false, error: 'Credenciales inválidas' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
    loadUserFromToken,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isOperador: user?.role === 'Operador',
    isCiudadano: user?.role === 'Ciudadano'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

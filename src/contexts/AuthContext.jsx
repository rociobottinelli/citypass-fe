import React, { createContext, useContext, useState, useEffect } from 'react';
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

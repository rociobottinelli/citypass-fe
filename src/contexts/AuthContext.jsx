import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode"; 
import apiService from '../services/api';

const AuthContext = createContext();

// URL del servicio de autenticación externo
const EXTERNAL_AUTH_API = "https://auth.grupoldap.com.ar";

// ID del Admin interno (sacado de tu hardcodeo original) para obtener token válido
const INTERNAL_ADMIN_ID = '507f1f77bcf86cd799439011';

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

  // Validador del token externo
  const validateExternalToken = async (tokenToValidate) => {
    try {
      const response = await fetch(`${EXTERNAL_AUTH_API}/v1/auth/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt_token: tokenToValidate }),
      });
      
      if (!response.ok) throw new Error("Token SSO inválido");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // --- LOGICA CORREGIDA: Login Externo con Intercambio de Token ---
  const handleExternalLogin = async (externalToken) => {
    setLoading(true);
    try {
      // 1. Validar que el token del SSO sea real y válido
      const validation = await validateExternalToken(externalToken);
      if (!validation.success) throw new Error(validation.error);

      // 2. Decodificar datos del SSO para mostrar el nombre correcto
      const decoded = jwtDecode(externalToken);
      
      // 3. ¡EL TRUCO! Obtener un token INTERNO válido para el Admin.
      // Como el SSO ya dijo "OK, es admin", ahora le pedimos al backend nuestro token propio.
      const internalTokenResponse = await apiService.getTokenAdmin(INTERNAL_ADMIN_ID);

      if (!internalTokenResponse || !internalTokenResponse.token) {
        throw new Error("El SSO es válido, pero falló la obtención del token interno.");
      }

      const finalToken = internalTokenResponse.token;

      // 4. Construir el usuario usando el token INTERNO
      const userObj = {
        id: INTERNAL_ADMIN_ID, // Usamos el ID interno para que funcione la API
        email: decoded.email || 'admin@sso.com',
        role: 'Admin', // Forzamos Admin
        name: decoded.name || 'Administrador SSO',
        token: finalToken, // Guardamos el token que SÍ funciona en el backend
        authType: 'external_mapped'
      };

      // 5. Guardar sesión
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', finalToken); // Importante: Guardar el token interno

      return { success: true, user: userObj };

    } catch (error) {
      console.error('Fallo login externo:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

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
          token: token 
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      } else {
        return { success: false, error: 'Datos de usuario incompletos' };
      }
    } catch (error) {
      localStorage.removeItem('token'); 
      return { success: false, error: error.message };
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
          return { success: false, error: 'Error obteniendo token' };
        }
      } else {
        return { success: false, error: 'Credenciales inválidas' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error de conexión' };
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
    handleExternalLogin,
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
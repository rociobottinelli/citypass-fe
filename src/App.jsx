import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import EmergencyButton from '@/components/EmergencyButton'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import AdminDashboard from '@/pages/AdminDashboard'
import OperadorDashboard from '@/pages/OperadorDashboard'
import CiudadanoDashboard from '@/pages/CiudadanoDashboard'

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Public Route Component (only accessible when not authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'Operador') {
      return <Navigate to="/operador/dashboard" replace />;
    } else if (user.role === 'Ciudadano') {
      return <Navigate to="/ciudadano/dashboard" replace />;
    }
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - Only accessible when not authenticated */}
          <Route path="/login" element={<PublicRoute><Layout><Login /></Layout></PublicRoute>} />
          
          {/* Protected Routes - Require authentication */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/emergency" 
            element={
              <ProtectedRoute>
                <Layout><EmergencyButton /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="Admin">
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Operador Routes */}
          <Route 
            path="/operador/dashboard" 
            element={
              <ProtectedRoute requiredRole="Operador">
                <Layout><OperadorDashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Ciudadano Routes */}
          <Route 
            path="/ciudadano/dashboard" 
            element={
              <ProtectedRoute requiredRole="Ciudadano">
                <Layout><CiudadanoDashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ciudadano/emergency" 
            element={
              <ProtectedRoute requiredRole="Ciudadano">
                <Layout><EmergencyButton /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

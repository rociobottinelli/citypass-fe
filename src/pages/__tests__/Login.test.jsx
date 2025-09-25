import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the AuthContext
const mockLogin = jest.fn();
const mockAuthContext = {
  login: mockLogin,
  loading: false,
  user: null,
  logout: jest.fn(),
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.loading = false;
  });

  test('shows test credentials', () => {
    renderLogin();
    
    expect(screen.getByText('Credenciales de prueba:')).toBeInTheDocument();
    expect(screen.getByText('• Admin: admin@citypass.com / 123456')).toBeInTheDocument();
    expect(screen.getByText('• Operador: operador@citypass.com / 123456')).toBeInTheDocument();
    expect(screen.getByText('• Ciudadano: ciudadano@citypass.com / 123456')).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles successful login for Admin role', async () => {
    const mockNavigate = jest.fn();
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    mockLogin.mockResolvedValue({
      success: true,
      user: { role: 'Admin' }
    });

    renderLogin();
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
    
    fireEvent.change(emailInput, { target: { value: 'admin@citypass.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@citypass.com', '123456');
    });
  });

  test('handles successful login for Operador role', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      user: { role: 'Operador' }
    });

    renderLogin();
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
    
    fireEvent.change(emailInput, { target: { value: 'operador@citypass.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('operador@citypass.com', '123456');
    });
  });

  test('handles successful login for Ciudadano role', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      user: { role: 'Ciudadano' }
    });

    renderLogin();
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
    
    fireEvent.change(emailInput, { target: { value: 'ciudadano@citypass.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('ciudadano@citypass.com', '123456');
    });
  });

  test('shows error message on failed login', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: 'Credenciales inválidas'
    });

    renderLogin();
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });

  test('validates required fields', () => {
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
    fireEvent.click(submitButton);
    
    // Form should not submit without required fields
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('renders terms and privacy policy links', () => {
    renderLogin();
    
    expect(screen.getByText('Términos de Servicio')).toBeInTheDocument();
    expect(screen.getByText('Política de Privacidad')).toBeInTheDocument();
    expect(screen.getByText('Regístrate aquí')).toBeInTheDocument();
  });
});

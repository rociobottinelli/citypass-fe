import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    mockLocation.href = '';
  });

  test('renders dashboard with welcome message', () => {
    renderDashboard();
    
    expect(screen.getByText('¡Bienvenido a Citypass+!')).toBeInTheDocument();
    expect(screen.getByText('Tu panel de control personal')).toBeInTheDocument();
  });

  test('renders logout button', () => {
    renderDashboard();
    
    const logoutButton = screen.getByRole('button', { name: 'Cerrar Sesión' });
    expect(logoutButton).toBeInTheDocument();
  });

  test('handles logout click', () => {
    renderDashboard();
    
    const logoutButton = screen.getByRole('button', { name: 'Cerrar Sesión' });
    fireEvent.click(logoutButton);
    
    expect(mockLocation.href).toBe('/');
  });

  test('renders quick stats cards', () => {
    renderDashboard();
    
    expect(screen.getByText('Atracciones Visitadas')).toBeInTheDocument();
    expect(screen.getByText('Eventos Asistidos')).toBeInTheDocument();
    expect(screen.getByText('Puntos Acumulados')).toBeInTheDocument();
    
    expect(screen.getByText('12')).toBeInTheDocument(); // Atracciones
    expect(screen.getByText('5')).toBeInTheDocument(); // Eventos
    expect(screen.getByText('2,450')).toBeInTheDocument(); // Puntos
  });

  test('renders upcoming events section', () => {
    renderDashboard();
    
    expect(screen.getByText('Próximos Eventos')).toBeInTheDocument();
    expect(screen.getByText('Eventos recomendados para ti')).toBeInTheDocument();
    
    expect(screen.getByText('Festival de Música')).toBeInTheDocument();
    expect(screen.getByText('15 de Septiembre')).toBeInTheDocument();
    expect(screen.getByText('Tour Gastronómico')).toBeInTheDocument();
    expect(screen.getByText('22 de Septiembre')).toBeInTheDocument();
  });

  test('renders popular attractions section', () => {
    renderDashboard();
    
    expect(screen.getByText('Atracciones Populares')).toBeInTheDocument();
    expect(screen.getByText('Descubre las atracciones más visitadas')).toBeInTheDocument();
    
    expect(screen.getByText('Museo de Arte')).toBeInTheDocument();
    expect(screen.getByText('4.8 ⭐ (1,234 reseñas)')).toBeInTheDocument();
    expect(screen.getByText('Parque Central')).toBeInTheDocument();
    expect(screen.getByText('4.6 ⭐ (987 reseñas)')).toBeInTheDocument();
  });

  test('renders action buttons', () => {
    renderDashboard();
    
    expect(screen.getAllByText('Ver Detalles')).toHaveLength(2);
    expect(screen.getAllByText('Visitar')).toHaveLength(2);
  });

  test('has proper styling classes', () => {
    renderDashboard();
    
    const logoutButton = screen.getByRole('button', { name: 'Cerrar Sesión' });
    expect(logoutButton).toHaveClass('border-brand-primary', 'text-brand-primary');
  });
});

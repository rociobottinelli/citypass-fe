import React from 'react';
import { render, screen } from '@testing-library/react';
import EmergencyHistory from '../EmergencyHistory';

const mockEmergencies = [
  {
    id: '1',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    tipo: 'accidente',
    ubicacion: 'Calle Principal 123',
    estado: 'Pendiente',
    servicios: ['Ambulancia', 'Policía'],
    detalles: 'Accidente de tránsito',
    prioridad: 'Alta',
    origen: 'Boton'
  },
  {
    id: '2',
    timestamp: new Date('2024-01-14T15:45:00Z'),
    tipo: 'incendio',
    ubicacion: 'Avenida Central 456',
    estado: 'En Proceso',
    servicios: ['Bomberos', 'Ambulancia'],
    detalles: 'Incendio en edificio residencial',
    prioridad: 'Crítica',
    origen: 'Formulario'
  }
];

describe('EmergencyHistory Component', () => {
  test('renders emergency history with title and description', () => {
    render(
      <EmergencyHistory
        emergencies={mockEmergencies}
        loading={false}
        onCancelEmergency={null}
        onReportEmergency={null}
        showReportButton={false}
        title="Historial de Emergencias"
        description="Tus emergencias reportadas recientemente"
      />
    );
    
    expect(screen.getByText('Historial de Emergencias')).toBeInTheDocument();
    expect(screen.getByText('Tus emergencias reportadas recientemente')).toBeInTheDocument();
  });

  test('displays emergency list correctly', () => {
    render(
      <EmergencyHistory
        emergencies={mockEmergencies}
        loading={false}
        onCancelEmergency={null}
        onReportEmergency={null}
        showReportButton={false}
        title="Historial de Emergencias"
        description="Tus emergencias reportadas recientemente"
      />
    );
    
    // Check that both emergencies are displayed
    expect(screen.getByText('Accidente de tránsito')).toBeInTheDocument();
    expect(screen.getByText('Incendio en edificio residencial')).toBeInTheDocument();
    
    // Check locations
    expect(screen.getByText('Calle Principal 123')).toBeInTheDocument();
    expect(screen.getByText('Avenida Central 456')).toBeInTheDocument();
    
    // Check states
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En Proceso')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(
      <EmergencyHistory
        emergencies={[]}
        loading={true}
        onCancelEmergency={null}
        onReportEmergency={null}
        showReportButton={false}
        title="Historial de Emergencias"
        description="Tus emergencias reportadas recientemente"
      />
    );
    
    expect(screen.getByText('Cargando emergencias...')).toBeInTheDocument();
  });

  test('shows empty state when no emergencies', () => {
    render(
      <EmergencyHistory
        emergencies={[]}
        loading={false}
        onCancelEmergency={null}
        onReportEmergency={null}
        showReportButton={false}
        title="Historial de Emergencias"
        description="Tus emergencias reportadas recientemente"
      />
    );
    
    expect(screen.getByText('No tienes emergencias reportadas')).toBeInTheDocument();
  });

  test('displays emergency services correctly', () => {
    render(
      <EmergencyHistory
        emergencies={mockEmergencies}
        loading={false}
        onCancelEmergency={null}
        onReportEmergency={null}
        showReportButton={false}
        title="Historial de Emergencias"
        description="Tus emergencias reportadas recientemente"
      />
    );
    
    // Services are rendered as badges; verify presence via role/text exists in document
    expect(screen.getAllByText('Ambulancia').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Policía').length).toBeGreaterThan(0);
  });

  test('displays states correctly', () => {
    render(
      <EmergencyHistory
        emergencies={mockEmergencies}
        loading={false}
        onCancelEmergency={null}
        onReportEmergency={null}
        showReportButton={false}
        title="Historial de Emergencias"
        description="Tus emergencias reportadas recientemente"
      />
    );
    
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En Proceso')).toBeInTheDocument();
  });

  test('shows time ago for timestamps', () => {
    render(
      <EmergencyHistory
        emergencies={mockEmergencies}
        loading={false}
        onCancelEmergency={null}
        onReportEmergency={null}
        showReportButton={false}
        title="Historial de Emergencias"
        description="Tus emergencias reportadas recientemente"
      />
    );
    
    // Check that relative time is displayed
    expect(screen.getAllByText(/Hace \d+/).length).toBeGreaterThan(0);
  });

  test('handles different emergency types', () => {
    const mixedEmergencies = [
      {
        id: '1',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        tipo: 'accidente',
        ubicacion: 'Calle Principal 123',
        estado: 'Pendiente',
        servicios: ['Ambulancia', 'Policía'],
        detalles: 'Accidente de tránsito',
        prioridad: 'Alta',
        origen: 'Boton'
      },
      {
        id: '2',
        timestamp: new Date('2024-01-14T15:45:00Z'),
        tipo: 'salud',
        ubicacion: 'Avenida Central 456',
        estado: 'Resuelto',
        servicios: ['Ambulancia'],
        detalles: 'Emergencia médica',
        prioridad: 'Media',
        origen: 'Formulario'
      }
    ];
    
    render(
      <EmergencyHistory
        emergencies={mixedEmergencies}
        loading={false}
        onCancelEmergency={null}
        onReportEmergency={null}
        showReportButton={false}
        title="Historial de Emergencias"
        description="Tus emergencias reportadas recientemente"
      />
    );
    
    expect(screen.getByText('Accidente de tránsito')).toBeInTheDocument();
    expect(screen.getByText('Emergencia médica')).toBeInTheDocument();
    expect(screen.getByText('Resuelto')).toBeInTheDocument();
  });
});

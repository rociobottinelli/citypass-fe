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
    
    expect(screen.getByText('Cargando historial...')).toBeInTheDocument();
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
    
    expect(screen.getByText('No hay emergencias registradas')).toBeInTheDocument();
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
    
    // Check that services are displayed
    expect(screen.getByText('Ambulancia')).toBeInTheDocument();
    expect(screen.getByText('Policía')).toBeInTheDocument();
    expect(screen.getByText('Bomberos')).toBeInTheDocument();
  });

  test('displays priority levels correctly', () => {
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
    
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Crítica')).toBeInTheDocument();
  });

  test('formats timestamps correctly', () => {
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
    
    // Check that dates are formatted and displayed
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/14\/01\/2024/)).toBeInTheDocument();
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

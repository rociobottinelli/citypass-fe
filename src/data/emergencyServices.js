// Emergency services configuration
export const emergencyServices = [
  {
    id: 'ambulancia',
    name: 'Ambulancia',
    description: 'Servicio médico de emergencia',
    icon: '🚑',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    borderColor: 'border-red-500',
    priority: 'high',
    responseTime: '5-10 min',
    phone: '911'
  },
  {
    id: 'policia',
    name: 'Policía',
    description: 'Fuerzas de seguridad',
    icon: '👮',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500',
    priority: 'high',
    responseTime: '3-8 min',
    phone: '911'
  },
  {
    id: 'bomberos',
    name: 'Bomberos',
    description: 'Servicio contra incendios',
    icon: '🚒',
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    borderColor: 'border-orange-500',
    priority: 'high',
    responseTime: '4-7 min',
    phone: '911'
  },
  {
    id: 'rescatistas',
    name: 'Rescatistas',
    description: 'Equipos de rescate especializado',
    icon: '🆘',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    borderColor: 'border-yellow-500',
    priority: 'medium',
    responseTime: '10-15 min',
    phone: '911'
  },
  {
    id: 'defensa_civil',
    name: 'Defensa Civil',
    description: 'Protección civil y emergencias',
    icon: '🛡️',
    color: 'bg-green-500',
    textColor: 'text-green-500',
    borderColor: 'border-green-500',
    priority: 'medium',
    responseTime: '8-12 min',
    phone: '911'
  },
  {
    id: 'psicologo',
    name: 'Apoyo Psicológico',
    description: 'Atención psicológica de emergencia',
    icon: '🧠',
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    borderColor: 'border-purple-500',
    priority: 'low',
    responseTime: '15-30 min',
    phone: '911'
  }
];

export const emergencyTypes = [
  {
    id: 'Accidente',
    name: 'Accidente',
    services: ['ambulancia', 'policia', 'bomberos'],
    description: 'Accidente de tránsito o laboral'
  },
  {
    id: 'Incendio',
    name: 'Incendio',
    services: ['bomberos', 'policia', 'ambulancia'],
    description: 'Fuego en edificio, vehículo o área'
  },
  {
    id: 'Robo/Violencia',
    name: 'Robo/Violencia',
    services: ['policia', 'ambulancia'],
    description: 'Acto delictivo o violencia en curso'
  },
  {
    id: 'ViolenciaFamiliar',
    name: 'Violencia Familiar',
    services: ['policia', 'psicologo', 'ambulancia'],
    description: 'Situación de violencia en el hogar'
  },
  {
    id: 'Salud',
    name: 'Salud',
    services: ['ambulancia', 'psicologo'],
    description: 'Emergencia médica o psicológica'
  },
  {
    id: 'Inundacion',
    name: 'Inundación',
    services: ['defensa_civil', 'rescatistas', 'bomberos'],
    description: 'Inundaciones o desbordes de agua'
  },
  {
    id: 'Otro',
    name: 'Otro',
    services: ['ambulancia', 'policia'],
    description: 'Otra situación de emergencia'
  }
];

export const emergencyStatuses = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  DISPATCHED: 'Enviada',
  ARRIVED: 'Llegó',
  RESOLVED: 'Resuelta',
  CANCELLED: 'Cancelada'
};

export const getServiceById = (id) => {
  return emergencyServices.find(service => service.id === id);
};

export const getServicesByIds = (ids) => {
  return emergencyServices.filter(service => ids.includes(service.id));
};

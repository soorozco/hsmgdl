
import { RequestStatus, RequestType, ShiftSettings, ShiftCycleType, User, UserRole, RequestRecord } from './types';

export const COLORS = {
  primary: '#1e40af', 
  secondary: '#10b981', 
  accent: '#0369a1', 
  danger: '#ef4444', 
  warning: '#f59e0b', 
};

export const DEPARTMENTS_DATA: { [key: string]: string[] } = {
  'Administración': ['Asistente de Administración', 'Dirección Administrativa', 'Secretaria Escuela'],
  'Almacén': ['Auxiliar de Almacén', 'Analista de Almacén', 'Coordinador de Almacén'],
  'Archivo': ['Auxiliar de Archivo', 'Coordinador de Archivo Clínico'],
  'Atención Continua': ['Admisión Hospitalaria', 'Admisión Urgencias', 'Coordinadora de Atención Continua', 'Recepción Consultorios', 'Recepción Hospitalaria', 'Recepción Imagenología', 'Recepción Laboratorio'],
  'Auditoría': ['Coordinación de Auditoría', 'Analista de Auditoría'],
  'Banco de Sangre': ['Químico'],
  'Capital Humano': ['Jefe Capital Humano', 'Analista de Capital Humano', 'Analista de Reclutamiento y Selección', 'Coordinador de Compensaciones y Beneficios'],
  'Casa Padre': ['Auxiliar de Cocina (CP)', 'Auxiliar de Enfermería (CP)', 'Auxiliar de Intendencia (CP)', 'Auxiliar de Mantenimiento (CP)'],
  'Cocina': ['Auxiliar de Cocina', 'Cajera', 'Chef', 'Nutrición Dietas'],
  'Compras': ['Coordinación de Compras'],
  'Contabilidad': ['Analista Contable', 'Auxiliar Contable', 'Jefe de Contabilidad', 'Analista de Facturación'],
  'Dirección Médica': ['Analista de Credencialización', 'Rehabilitación'],
  'Enfermería': ['Auxiliar de Enfermería', 'Camillero', 'Enfermero Especialista', 'Enfermero General', 'Jefatura de Enseñanza', 'Jefatura de Enfermería', 'Lic. en Enfermería', 'Subjefatura de Enfermería', 'Terapista Respiratorio'],
  'Farmacia': ['Auxiliar de Farmacia Clínica', 'Farmacia Quirófano', 'Farmacología Clínica', 'Jefatura de Farmacia Hospitalaria'],
  'Intendencia': ['Ama de Llaves', 'Auxiliar de Intendencia'],
  'Laboratorio': ['Coordinación de Laboratorio', 'Químico Laboratorista'],
  'Mantenimiento': ['Auxiliar de Mantenimiento', 'Encargado de Mantenimiento'],
  'Nutrición': ['Nutrióloga'],
  'Pastoral de Salud': ['Pastoral de la Salud'],
  'Rayos X': ['Técnico Radiólogo'],
  'Ropería': ['Auxiliar de Ropería'],
  'Seguridad e Higiene': ['Analista de Seguridad e Higiene', 'Jefe de Seguridad e Higiene', 'Albañiles'],
  'Seguros': ['Coordinador de Seguros', 'Analista de Seguros'],
  'Tecnologías de la Información': ['Jefatura de TI', 'Técnico en TI'],
  'UVEH': ['Auxiliar de UVEH', 'Coordinador de UVEH']
};

export const AREAS = Object.keys(DEPARTMENTS_DATA).sort();
export const POSITIONS = [...new Set(Object.values(DEPARTMENTS_DATA).flat())].sort();

export const DEFAULT_SHIFTS: ShiftSettings[] = [
  { 
    id: 'matutino', 
    name: 'Turno Matutino', 
    workDays: [1, 2, 3, 4, 5, 6, 0], 
    startTime: '07:00', 
    endTime: '15:00',
    cycleType: ShiftCycleType.WEEKLY,
    restDay: 0 
  },
  { 
    id: 'vespertino', 
    name: 'Turno Vespertino', 
    workDays: [1, 2, 3, 4, 5, 6, 0], 
    startTime: '14:30', 
    endTime: '21:30',
    cycleType: ShiftCycleType.WEEKLY,
    restDay: 0 
  },
  { 
    id: 'nocturno1', 
    name: 'Nocturno 1', 
    workDays: [2, 4, 6], 
    startTime: '21:00', 
    endTime: '07:30',
    cycleType: ShiftCycleType.ALTERNATING_SUNDAY_ODD 
  },
  { 
    id: 'nocturno2', 
    name: 'Nocturno 2', 
    workDays: [1, 3, 5], 
    startTime: '21:00', 
    endTime: '07:30',
    cycleType: ShiftCycleType.ALTERNATING_SUNDAY_EVEN 
  },
  { 
    id: 'especial', 
    name: 'Jornada Especial', 
    workDays: [6, 0], 
    startTime: '07:00', 
    endTime: '20:00',
    cycleType: ShiftCycleType.SPECIAL 
  },
];

export const getStatusConfig = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.PENDING:
      return { label: 'Pendiente', color: 'bg-amber-100 text-amber-800' };
    case RequestStatus.APPROVED_MANAGER:
      return { label: 'Aprobado Área', color: 'bg-blue-100 text-blue-800' };
    case RequestStatus.APPROVED_HR:
      return { label: 'Aprobado RH', color: 'bg-emerald-100 text-emerald-800' };
    case RequestStatus.REJECTED:
      return { label: 'Rechazado', color: 'bg-red-100 text-red-800' };
    default:
      return { label: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
  }
};

// FIX: Typed MOCK_USERS as User[] and used UserRole enum for roles to ensure type safety.
export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Dra. Elena Martínez',
    email: 'elena@hospital.com',
    role: UserRole.WORKER,
    area: 'Enfermería',
    position: 'Lic. en Enfermería',
    hireDate: '2022-01-15',
    birthDate: '1990-05-20',
    username: '10567',
    password: 'password123',
    vacationDays: 14,
    sindicalDays: 1,
    absences: 1,
    delaysInMinutes: 45,
    shiftId: 'nocturno1'
  },
  {
    id: '2',
    name: 'Lic. Ricardo Gómez',
    email: 'ricardo@hospital.com',
    role: UserRole.MANAGER,
    area: 'Enfermería',
    position: 'Jefatura de Enfermería',
    hireDate: '2018-05-10',
    birthDate: '1985-11-12',
    username: 'rgomez',
    password: 'password456',
    vacationDays: 20,
    sindicalDays: 1,
    absences: 0,
    delaysInMinutes: 0,
    shiftId: 'matutino',
    authorizes: ['Enfermería']
  },
  {
    id: '3',
    name: 'Mtra. Sofía Ruiz',
    email: 'sofia@hospital.com',
    role: UserRole.ADMIN_RH,
    area: 'Capital Humano',
    position: 'Jefe Capital Humano',
    hireDate: '2015-11-20',
    birthDate: '1988-02-28',
    username: 'sruiz',
    password: 'password789',
    vacationDays: 22,
    sindicalDays: 1,
    absences: 0,
    delaysInMinutes: 0,
    shiftId: 'matutino'
  },
  {
    id: '4',
    name: 'Carlos Sánchez',
    email: 'carlos@hospital.com',
    role: UserRole.WORKER,
    area: 'Enfermería',
    position: 'Enfermero General',
    hireDate: '2023-02-20',
    birthDate: '1995-08-15',
    username: '20111',
    password: 'password123',
    vacationDays: 12,
    sindicalDays: 1,
    absences: 0,
    delaysInMinutes: 10,
    shiftId: 'vespertino'
  }
];

// FIX: Typed MOCK_REQUESTS as RequestRecord[] to ensure type safety.
export const MOCK_REQUESTS: RequestRecord[] = [
  {
    id: 'r1',
    userId: '1',
    userName: 'Dra. Elena Martínez',
    type: RequestType.VACATION,
    startDate: '2024-06-10',
    endDate: '2024-06-15',
    reason: 'Vacaciones familiares anuales.',
    status: RequestStatus.PENDING,
    createdAt: '2024-05-20'
  },
  {
    id: 'r2',
    userId: '4',
    userName: 'Carlos Sánchez',
    type: RequestType.VACATION,
    startDate: '2024-07-01',
    endDate: '2024-07-05',
    reason: 'Viaje programado.',
    status: RequestStatus.PENDING,
    createdAt: '2024-06-01'
  }
];
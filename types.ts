
export enum UserRole {
  WORKER = 'TRABAJADOR',
  MANAGER = 'JEFE_AREA',
  ADMIN_RH = 'ADMIN_RH'
}

export enum RequestStatus {
  PENDING = 'PENDIENTE',
  APPROVED_MANAGER = 'APROBADO_AREA',
  APPROVED_HR = 'APROBADO_RH',
  REJECTED = 'RECHAZADO'
}

export enum RequestType {
  SINDICAL = 'DÍA SINDICAL',
  VACATION = 'VACACIONAL',
  CONVENIO = 'CONVENIO',
  BIRTHDAY = 'CUMPLEAÑOS',
  ABSENCE = 'FALTA',
  DELAY = 'RETARDO',
  PASS_EXIT = 'PASE DE SALIDA',
  PASS_ENTRY = 'PASE DE ENTRADA'
}

export enum ShiftCycleType {
  WEEKLY = 'SEMANAL', // Standard 6x1
  ALTERNATING_SUNDAY_ODD = 'DOMINGOS_NONES', // Nocturno 1 logic
  ALTERNATING_SUNDAY_EVEN = 'DOMINGOS_PARES', // Nocturno 2 logic
  SPECIAL = 'ESPECIAL'
}

export interface ShiftSettings {
  id: string;
  name: string;
  workDays: number[]; 
  startTime: string;
  endTime: string;
  cycleType: ShiftCycleType;
  restDay?: number; 
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area: string;
  position?: string;
  hireDate: string;
  birthDate: string; 
  vacationDays: number;
  sindicalDays: number; 
  absences: number;
  delaysInMinutes: number;
  shiftId: string; 
  username?: string;
  password?: string;
  customRestDay?: number;
  customStartTime?: string;
  customEndTime?: string;
  needsPasswordReset?: boolean;
  authorizes?: string[];
}

export interface RequestRecord {
  id: string;
  userId: string;
  userName: string;
  type: RequestType;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  reason: string;
  status: RequestStatus;
  attachment?: string;
  managerObservation?: string;
  hrObservation?: string;
  createdAt: string;
}
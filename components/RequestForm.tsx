
import React, { useState } from 'react';
import { RequestType, User, RequestRecord, RequestStatus } from '../types';
import { X, Calendar, FileText, Paperclip, Clock, AlertCircle } from 'lucide-react';

interface RequestFormProps {
  user: User;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialType: RequestType;
  existingRequests: RequestRecord[];
}

export const RequestForm: React.FC<RequestFormProps> = ({ user, onClose, onSubmit, initialType, existingRequests }) => {
  const [formData, setFormData] = useState({
    type: initialType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    reason: '',
    attachment: null as File | null
  });

  const [error, setError] = useState<string | null>(null);
  
  const isPassMode = initialType === RequestType.PASS_EXIT || initialType === RequestType.PASS_ENTRY;

  const isVacation = formData.type === RequestType.VACATION;
  const isSindical = formData.type === RequestType.SINDICAL;
  const isConvenio = formData.type === RequestType.CONVENIO;
  const isPass = formData.type === RequestType.PASS_EXIT || formData.type === RequestType.PASS_ENTRY;
  const isExitPass = formData.type === RequestType.PASS_EXIT;

  const calculateRequestedDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return 0;
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculateMinutes = (start: string, end: string): number => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const getSeniorityYears = () => {
    const hire = new Date(user.hireDate);
    const now = new Date();
    let years = now.getFullYear() - hire.getFullYear();
    const monthDiff = now.getMonth() - hire.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < hire.getDate())) {
      years--;
    }
    return years;
  };

  const hasTakenSindicalThisAnniversaryYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Use local timezone for all dates to avoid off-by-one errors
    let anniversaryStart = new Date(user.hireDate + 'T00:00:00');
    anniversaryStart.setFullYear(currentYear);
    
    // If this year's anniversary hasn't happened yet, the anniversary year started last year.
    if (anniversaryStart > now) {
      anniversaryStart.setFullYear(currentYear - 1);
    }

    return existingRequests.some(r => {
        const requestDate = new Date(r.startDate + 'T00:00:00');
        return r.type === RequestType.SINDICAL && 
               r.status !== RequestStatus.REJECTED &&
               requestDate >= anniversaryStart;
    });
  };

  const getUsedPassMinutesThisMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return existingRequests
      .filter(r => {
        const requestDate = new Date(r.startDate + 'T00:00:00'); // Local timezone
        return (r.type === RequestType.PASS_EXIT || r.type === RequestType.PASS_ENTRY) && 
               r.status !== RequestStatus.REJECTED &&
               requestDate.getMonth() === currentMonth &&
               requestDate.getFullYear() === currentYear
      })
      .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const now = new Date();
    const startDateObj = new Date(formData.startDate + 'T00:00:00');
    const diffInMs = startDateObj.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (isVacation && diffInHours < 72) {
      setError('Las vacaciones deben solicitarse con al menos 72 horas de antelación.');
      return;
    }

    if ((isSindical || isConvenio || isPass) && diffInHours < 24) {
      setError('Este trámite debe solicitarse con al menos 24 horas de antelación.');
      return;
    }

    const seniorityYears = getSeniorityYears();

    if (isVacation || isSindical) {
      if (seniorityYears < 1) {
        setError(`Debes cumplir al menos 1 año de antigüedad para este trámite. (Ingreso: ${user.hireDate})`);
        return;
      }
    }

    if (isSindical) {
      if (hasTakenSindicalThisAnniversaryYear()) {
        setError('Ya has utilizado tu Día Sindical correspondiente a este año de labores.');
        return;
      }
    }

    if (isPass) {
      const mins = calculateMinutes(formData.startTime, formData.endTime);
      if (mins <= 0) {
        setError('La hora de fin debe ser posterior a la de inicio.');
        return;
      }
      if (mins > 120) {
        setError('El pase no puede exceder 120 minutos (2 horas) por solicitud.');
        return;
      }
      
      const usedThisMonth = getUsedPassMinutesThisMonth();
      if (usedThisMonth + mins > 120) {
        const remaining = 120 - usedThisMonth;
        setError(`Límite mensual excedido. Te quedan ${remaining} minutos disponibles de los 120 permitidos al mes.`);
        return;
      }

      onSubmit({
        ...formData,
        endDate: formData.startDate,
        durationMinutes: mins
      });
      return;
    }

    const requestedDays = calculateRequestedDays(formData.startDate, formData.endDate);
    if (requestedDays <= 0) {
      setError('Selecciona un rango de fechas válido.');
      return;
    }

    if (isVacation) {
      if (requestedDays > user.vacationDays) {
        setError(`Días de vacaciones insuficientes. Disponibles: ${user.vacationDays}`);
        return;
      }
      onSubmit({ ...formData, reason: 'Vacaciones' });
    } else {
      if (!formData.reason && !isPass) {
        setError('Por favor explica el motivo.');
        return;
      }
      onSubmit(formData);
    }
  };

  const requestedDays = calculateRequestedDays(formData.startDate, formData.endDate);
  const usedPassMinutes = getUsedPassMinutesThisMonth();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {isPassMode ? 'Solicitar Pase' : isVacation ? 'Solicitar Vacaciones' : isSindical ? 'Solicitar Día Sindical' : 'Nuevo Trámite'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isVacation && (
            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center border border-blue-100">
              <div>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Disponibles</p>
                <p className="text-2xl font-bold text-blue-900">{user.vacationDays}d</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Solicitados</p>
                <p className={`text-2xl font-bold ${requestedDays > user.vacationDays ? 'text-red-600' : 'text-blue-900'}`}>
                  {requestedDays}d
                </p>
              </div>
            </div>
          )}

          {isPass && (
            <div className="bg-amber-50 p-4 rounded-xl flex justify-between items-center border border-amber-100">
              <div>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Usado este mes</p>
                <p className="text-2xl font-bold text-amber-900">{usedPassMinutes}m</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Disponible</p>
                <p className="text-2xl font-bold text-amber-900">{Math.max(0, 120 - usedPassMinutes)}m</p>
              </div>
            </div>
          )}

          {isSindical && (
             <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Beneficio Anual</p>
                <p className="text-sm font-bold text-emerald-900">
                  {hasTakenSindicalThisAnniversaryYear() ? '⚠️ Ya utilizado este año' : '✅ 1 día disponible'}
                </p>
             </div>
          )}
          
          {isPassMode && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tipo de Trámite</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as RequestType })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={RequestType.PASS_EXIT}>Pase de Salida</option>
                <option value={RequestType.PASS_ENTRY}>Pase de Entrada</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: isPass || isSindical ? e.target.value : formData.endDate })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3.5 text-sm font-bold outline-none"
                />
              </div>
            </div>

            {!isPass && !isSindical && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Hasta (Inclusive)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3.5 text-sm font-bold outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {isPass && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{isExitPass ? 'Salida' : 'Entrada Oficial'}</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{isExitPass ? 'Regreso' : 'Llegada Real'}</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none"
                />
              </div>
            </div>
          )}

          {!isVacation && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Motivo / Observaciones</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={2}
                placeholder="Justificación del trámite..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex gap-2 items-center text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-[11px] font-bold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Enviar Solicitud
          </button>
        </form>
      </div>
    </div>
  );
};
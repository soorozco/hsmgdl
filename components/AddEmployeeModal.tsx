
import React from 'react';
import { User } from '../types';
import { AREAS, DEPARTMENTS_DATA } from '../constants';
import { X, UserPlus } from 'lucide-react';

interface AddEmployeeModalProps {
  onClose: () => void;
  data: Partial<User>;
  setData: React.Dispatch<React.SetStateAction<Partial<User>>>;
  onSubmit: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ onClose, data, setData, onSubmit }) => {
  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newArea = e.target.value;
    const newPositions = DEPARTMENTS_DATA[newArea] || [];
    setData(d => ({
        ...d,
        area: newArea,
        position: newPositions[0] || ''
    }));
  };
  
  const availablePositions = data.area ? DEPARTMENTS_DATA[data.area] : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Agregar Nuevo Empleado</h2>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
            </div>
            <div className="space-y-4">
                <input type="text" placeholder="Nombre completo" value={data.name} onChange={(e) => setData(d => ({...d, name: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"/>
                <input type="email" placeholder="Correo electrónico" value={data.email} onChange={(e) => setData(d => ({...d, email: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"/>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Usuario / No. Trab." value={data.username} onChange={(e) => setData(d => ({...d, username: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"/>
                    <input type="text" placeholder="Contraseña inicial" value={data.password} onChange={(e) => setData(d => ({...d, password: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Fecha de Ingreso</label>
                      <input type="date" value={data.hireDate} onChange={(e) => setData(d => ({...d, hireDate: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700"/>
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Fecha de Nacimiento</label>
                      <input type="date" value={data.birthDate} onChange={(e) => setData(d => ({...d, birthDate: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Área</label>
                        <select value={data.area} onChange={handleAreaChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm">
                            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Puesto</label>
                        <select value={data.position} onChange={(e) => setData(d => ({...d, position: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" disabled={!data.area}>
                            {availablePositions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={onSubmit} className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2">
                    <UserPlus size={18}/> Registrar Empleado
                </button>
            </div>
        </div>
    </div>
  );
};

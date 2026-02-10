import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
            </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">{title}</h2>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full bg-red-600 text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-all"
          >
            Confirmar Eliminación
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 rounded-2xl active:scale-95 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
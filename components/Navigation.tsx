
import React from 'react';
import { Home, ClipboardList, History, User, Settings } from 'lucide-react';
import { UserRole } from '../types';

interface NavigationProps {
  currentTab: string;
  setTab: (tab: string) => void;
  role: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab, role }) => {
  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: Home },
  ];

  if (role === UserRole.MANAGER || role === UserRole.ADMIN_RH) {
    tabs.push({ id: 'solicitudes', label: 'Solicitudes', icon: ClipboardList });
  }

  if (role === UserRole.ADMIN_RH) {
    tabs.push({ id: 'config', label: 'Ajustes', icon: Settings });
  }

  tabs.push({ id: 'historial', label: 'Historial', icon: History });
  tabs.push({ id: 'perfil', label: 'Perfil', icon: User });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center px-2 py-3 safe-area-bottom z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-300 w-16 ${
              isActive ? 'text-blue-700 scale-110' : 'text-gray-400'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
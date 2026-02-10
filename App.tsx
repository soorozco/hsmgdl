
import React, { useState, useMemo, useRef } from 'react';
import { UserRole, RequestStatus, RequestType, User, RequestRecord, ShiftSettings, ShiftCycleType } from './types';
import { MOCK_USERS, MOCK_REQUESTS, getStatusConfig, DEFAULT_SHIFTS, AREAS, DEPARTMENTS_DATA } from './constants';
import { Navigation } from './components/Navigation';
import { StatsCard } from './components/StatsCard';
import { RequestForm } from './components/RequestForm';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Nom035Survey } from './components/Nom035Survey';
import { PerformanceEvaluation } from './components/PerformanceEvaluation';
import { WorkClimateSurvey } from './components/WorkClimateSurvey';
import { read, utils, writeFile } from 'xlsx';
import { 
  LogOut, 
  Bell, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Briefcase,
  ChevronRight,
  Check,
  X,
  Settings,
  User as UserIcon,
  Save,
  HeartPulse,
  Search,
  UserCog,
  ChevronUp,
  SlidersHorizontal,
  DoorOpen,
  Cake,
  Sparkles,
  UserPlus,
  RotateCcw,
  Award,
  Loader2,
  CheckCircle,
  KeyRound,
  Trash2,
  BarChart,
  Plane,
  TrendingUp,
  ClipboardList,
  FileUp,
  FileSpreadsheet,
  FileDown,
  ClipboardCheck,
  LayoutGrid,
  ArrowLeft,
  ClipboardPenLine,
  Smile
} from 'lucide-react';

const NEW_EMPLOYEE_TEMPLATE: Partial<User> = {
  name: '',
  email: '',
  username: '',
  password: '',
  hireDate: new Date().toISOString().split('T')[0],
  birthDate: '1990-01-01',
  area: AREAS[0],
  position: DEPARTMENTS_DATA[AREAS[0]][0],
  shiftId: DEFAULT_SHIFTS[0].id,
  role: UserRole.WORKER,
  vacationDays: 12,
  sindicalDays: 1,
  absences: 0,
  delaysInMinutes: 0
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('inicio');
  const [requests, setRequests] = useState<RequestRecord[]>(MOCK_REQUESTS);
  const [staff, setStaff] = useState<User[]>(MOCK_USERS);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [shiftSettings, setShiftSettings] = useState<ShiftSettings[]>(DEFAULT_SHIFTS);
  const [formInitialType, setFormInitialType] = useState<RequestType>(RequestType.VACATION);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState<Partial<User>>(NEW_EMPLOYEE_TEMPLATE);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // View state for workers
  const [workerView, setWorkerView] = useState<'hub' | 'app' | 'evaluations' | 'survey_nom035' | 'survey_performance' | 'survey_climate'>('hub');

  // Unified Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginView, setLoginView] = useState<'login' | 'reset'>('login');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = (username: string, password_param?: string) => {
    setLoginError('');
    const foundUser = staff.find(u => u.username?.toLowerCase() === username.toLowerCase());

    if (!foundUser) {
      setLoginError('Usuario no encontrado.');
      return;
    }
    
    if (foundUser.needsPasswordReset) {
      setLoginView('reset');
      return;
    }

    if (foundUser.password === password_param) {
        setLoading(true);
        setTimeout(() => {
            setUser(foundUser);
            if(foundUser.role === UserRole.WORKER) {
              setWorkerView('hub');
            }
            setLoading(false);
            setLoginUsername('');
            setLoginPassword('');
        }, 500);
    } else {
        setLoginError('Contraseña incorrecta. Inténtalo de nuevo.');
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    setCurrentTab('inicio');
    setEditingStaffId(null);
  };

  const openRequestForm = (type: RequestType) => {
    setFormInitialType(type);
    setShowRequestForm(true);
  };
  
  const handleAddEmployee = () => {
    if (!newEmployeeData.name || !newEmployeeData.email || !newEmployeeData.username || !newEmployeeData.password) {
      alert("Por favor, complete todos los campos requeridos.");
      return;
    }
    const newEmployee: User = {
      id: `u${Date.now()}`,
      ...NEW_EMPLOYEE_TEMPLATE,
      ...newEmployeeData
    } as User;
    
    setStaff(prev => [newEmployee, ...prev]);
    setShowAddEmployeeModal(false);
    setNewEmployeeData(NEW_EMPLOYEE_TEMPLATE);
    alert(`${newEmployee.name} ha sido agregado al personal.`);
  };

  const handleCreateRequest = (data: any) => {
    const newRequest: RequestRecord = {
      id: `r${Date.now()}`,
      userId: user!.id,
      userName: user!.name,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      durationMinutes: data.durationMinutes,
      reason: data.reason,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      attachment: data.attachment ? 'file_placeholder.pdf' : undefined
    };
    setRequests([newRequest, ...requests]);
    setShowRequestForm(false);
    alert('Solicitud enviada con éxito.');
  };
  
  const openDeleteConfirmation = (userId: string, userName: string) => {
    setEmployeeToDelete({ id: userId, name: userName });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteEmployee = () => {
    if (!employeeToDelete) return;
    setStaff(prev => prev.filter(u => u.id !== employeeToDelete.id));
    setEditingStaffId(null);
    alert(`${employeeToDelete.name} ha sido eliminado.`);
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleResetPassword = (userId: string, userName: string) => {
    updateStaffOverride(userId, { needsPasswordReset: true });
    alert(`Se ha habilitado el restablecimiento de contraseña para ${userName}. Deberá crear una nueva al intentar iniciar sesión.`);
  };

  const handleUpdatePassword = (username: string, newPass: string) => {
    setStaff(prev => prev.map(u => 
      u.username?.toLowerCase() === username.toLowerCase()
        ? { ...u, password: newPass, needsPasswordReset: false } 
        : u
    ));
    alert('Contraseña actualizada con éxito. Por favor, inicia sesión de nuevo.');
    setLoginView('login');
    setNewPassword('');
    setConfirmPassword('');
    setLoginPassword('');
  };

  const handleUpdateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
    setRequests(prev => prev.map(req => (req.id === requestId ? { ...req, status: newStatus } : req)));
    alert(`La solicitud ha sido procesada correctamente.`);
  };

  const updateStaffOverride = (userId: string, updates: Partial<User>) => {
    setStaff(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)));
    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleAuthorizationChange = (staffId: string, area: string, isChecked: boolean) => {
    const targetUser = staff.find(u => u.id === staffId);
    if (!targetUser) return;

    const currentAuthorizations = targetUser.authorizes || [];
    let newAuthorizations: string[];

    if (isChecked) {
        newAuthorizations = [...new Set([...currentAuthorizations, area])];
    } else {
        newAuthorizations = currentAuthorizations.filter(a => a !== area);
    }
    
    updateStaffOverride(staffId, { authorizes: newAuthorizations });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExcelImportClick = () => {
    excelFileInputRef.current?.click();
  };
  
  const handleExportToExcel = () => {
    const dataToExport = staff.map(s => ({
      'ID': s.id,
      'Nombre Completo': s.name,
      'Email': s.email,
      'Rol': s.role,
      'Área': s.area,
      'Puesto': s.position,
      'Fecha de Contratación': s.hireDate,
      'Fecha de Nacimiento': s.birthDate,
      'Usuario': s.username,
      'Contraseña': s.password,
      'Días de Vacaciones': s.vacationDays,
      'Días Sindicales': s.sindicalDays,
      'ID de Turno': s.shiftId,
      'Áreas que Autoriza': s.authorizes?.join(', '),
      'Necesita Resetear Pass': s.needsPasswordReset ? 'VERDADERO' : 'FALSO'
    }));

    try {
      const worksheet = utils.json_to_sheet(dataToExport);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Personal");
      const fileName = `Respaldo_Personal_HSM_${new Date().toISOString().split('T')[0]}.xlsx`;
      writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      alert("No se pudo generar el archivo de Excel. Revise la consola para más detalles.");
    }
  };

  const handleFileExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = utils.sheet_to_json(worksheet, { raw: false });

            const importedUsers: User[] = jsonData.map((row: any) => {
                const user: Partial<User> = {
                    id: String(row['ID']),
                    name: row['Nombre Completo'],
                    email: row['Email'],
                    role: row['Rol'] as UserRole,
                    area: row['Área'],
                    position: row['Puesto'],
                    hireDate: row['Fecha de Contratación'],
                    birthDate: row['Fecha de Nacimiento'],
                    username: String(row['Usuario']),
                    password: String(row['Contraseña']),
                    vacationDays: Number(row['Días de Vacaciones']),
                    sindicalDays: Number(row['Días Sindicales']),
                    shiftId: row['ID de Turno'],
                    authorizes: typeof row['Áreas que Autoriza'] === 'string'
                        ? row['Áreas que Autoriza'].split(',').map((s: string) => s.trim())
                        : [],
                    needsPasswordReset: ['VERDADERO', 'TRUE', '1', 1].includes(String(row['Necesita Resetear Pass']).toUpperCase()),
                    absences: 0,
                    delaysInMinutes: 0,
                };
                return user as User;
            });

            if (!Array.isArray(importedUsers)) {
                throw new Error("El archivo de Excel no pudo ser procesado a un array de usuarios.");
            }

            let addedCount = 0;
            let updatedCount = 0;

            setStaff(currentStaff => {
                const staffMap = new Map(currentStaff.map(u => [u.id, u]));
                importedUsers.forEach(importedUser => {
                    if (typeof importedUser !== 'object' || importedUser === null) {
                        console.warn("Usuario importado de Excel omitido por ser inválido:", importedUser);
                        return;
                    }
                    if (!importedUser.id || !importedUser.name || !importedUser.role || !importedUser.area) {
                        console.warn("Usuario importado de Excel omitido por falta de campos requeridos:", importedUser);
                        return;
                    }
                    const existingUser = staffMap.get(importedUser.id);
                    if (existingUser) {
                        updatedCount++;
                        staffMap.set(importedUser.id, Object.assign({}, existingUser, importedUser));
                    } else {
                        addedCount++;
                        staffMap.set(importedUser.id, { ...NEW_EMPLOYEE_TEMPLATE, ...importedUser } as User);
                    }
                });
                return Array.from(staffMap.values());
            });

             alert(`Importación desde Excel completada. \n- ${addedCount} usuarios agregados. \n- ${updatedCount} usuarios actualizados.`);

        } catch (error: any) {
            alert(`Error al importar el archivo Excel: ${error.message}`);
        } finally {
            if (event.target) {
                event.target.value = '';
            }
        }
    };
    reader.onerror = () => {
        alert("Error al leer el archivo Excel.");
    }
    reader.readAsBinaryString(file);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("El archivo no se pudo leer.");
        }
        const importedUsers: User[] = JSON.parse(text);

        if (!Array.isArray(importedUsers)) {
          throw new Error("El JSON debe ser un array de usuarios.");
        }

        let addedCount = 0;
        let updatedCount = 0;

        setStaff(currentStaff => {
          const staffMap = new Map(currentStaff.map(u => [u.id, u]));

          importedUsers.forEach(importedUser => {
            if (typeof importedUser !== 'object' || importedUser === null) {
                console.warn("Usuario importado omitido por ser inválido:", importedUser);
                return;
            }
            if (!importedUser.id || !importedUser.name || !importedUser.role || !importedUser.area) {
              console.warn("Usuario importado omitido por falta de campos requeridos:", importedUser);
              return; 
            }
            
            const existingUser = staffMap.get(importedUser.id);
            if (existingUser) {
              updatedCount++;
              staffMap.set(importedUser.id, Object.assign({}, existingUser, importedUser));
            } else {
              addedCount++;
              staffMap.set(importedUser.id, { ...NEW_EMPLOYEE_TEMPLATE, ...importedUser } as User);
            }
          });

          return Array.from(staffMap.values());
        });

        alert(`Importación completada. \n- ${addedCount} usuarios agregados. \n- ${updatedCount} usuarios actualizados.`);

      } catch (error: any) {
        alert(`Error al importar el archivo: ${error.message}`);
      } finally {
        if (event.target) {
          event.target.value = '';
        }
      }
    };
    reader.onerror = () => {
        alert("Error al leer el archivo.");
    }
    reader.readAsText(file);
  };

  const handleSurveySubmit = (answers: { [key: number]: number }) => {
    console.log("NOM-035 Survey Answers for user:", user?.id, answers);
    alert('Gracias por completar la evaluación. Tus respuestas han sido enviadas de forma confidencial.');
    setWorkerView('evaluations');
  };
  
  const handlePerformanceEvaluationSubmit = (answers: any) => {
    console.log("Performance Evaluation Answers for user:", user?.id, answers);
    alert('Gracias por completar la evaluación de desempeño.');
    setWorkerView('evaluations');
  };

  const handleWorkClimateSurveySubmit = (answers: any) => {
    console.log("Work Climate Survey Answers for user:", user?.id, answers);
    alert('Gracias por completar la encuesta de clima laboral.');
    setWorkerView('evaluations');
  };

  const isBirthdayToday = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const birth = new Date(dateStr + 'T00:00:00');
    return today.getDate() === birth.getDate() && today.getMonth() === birth.getMonth();
  };
  
  const getSeniorityYears = (hireDateStr: string) => {
    const hire = new Date(hireDateStr);
    const now = new Date();
    let years = now.getFullYear() - hire.getFullYear();
    const monthDiff = now.getMonth() - hire.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < hire.getDate())) {
        years--;
    }
    return years;
  };

  const isWorkAnniversaryToday = (dateStr: string) => {
      if (!dateStr) return false;
      const today = new Date();
      const hire = new Date(dateStr + 'T00:00:00');
      return today.getDate() === hire.getDate() && today.getMonth() === hire.getMonth();
  };

  const filteredStaff = useMemo(() => {
    let staffToShow = staff;
    if (user?.role === UserRole.MANAGER) {
        staffToShow = staff.filter(s => s.area === user.area || s.id === user.id);
    }
    return staffToShow.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [staff, searchTerm, user]);

  const getUsedPassMinutesThisMonth = (userRequests: RequestRecord[]): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return userRequests
      .filter(r => 
        (r.type === RequestType.PASS_EXIT || r.type === RequestType.PASS_ENTRY) && 
        r.status !== RequestStatus.REJECTED &&
        new Date(r.startDate).getMonth() === currentMonth &&
        new Date(r.startDate).getFullYear() === currentYear
      )
      .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  };
  
  const renderLogin = () => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleLogin(loginUsername, loginPassword);
    };
    
    const handleResetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      if (newPassword.length < 6) {
        setLoginError('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setLoginError('Las contraseñas no coinciden.');
        return;
      }
      handleUpdatePassword(loginUsername, newPassword);
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 max-w-md mx-auto">
        <div className="w-20 h-20 bg-teal-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-teal-200 mb-8 animate-pulse">
            <HeartPulse size={40} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">Hospital Santa Margarita</h1>
        <p className="text-gray-500 text-center mb-10 font-medium">Gestión inteligente de personal.</p>
        
        <div className="w-full">
        {loginView === 'login' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Usuario / No. de Trabajador</label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 10567 o rgomez"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contraseña</label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            {loginError && <p className="text-xs text-red-500 font-bold text-center pt-2">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all text-sm uppercase tracking-widest mt-4"
            >
              Iniciar Sesión
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4 animate-in fade-in duration-300">
            <p className="text-center text-sm font-bold text-gray-700">Hola {loginUsername}, crea tu nueva contraseña.</p>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nueva Contraseña</label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirmar Contraseña</label>
              <div className="relative">
                <Check size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </div>
            {loginError && <p className="text-xs text-red-500 font-bold text-center pt-2">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all text-sm uppercase tracking-widest mt-4"
            >
              Guardar y Acceder
            </button>
          </form>
        )}
        </div>
      </div>
    );
  };

  const renderConfigPanel = () => (
    <div className="pb-32 pt-8 px-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <UserCog size={24} />
            </div>
            <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión Personal</h2>
            <p className="text-gray-500 text-sm">Ajustes y control de equipo</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={handleExportToExcel} className="p-3 bg-gray-600 text-white rounded-2xl shadow-lg shadow-gray-200 active:scale-95 transition-transform" title="Exportar a Excel">
                <FileDown size={20}/>
            </button>
            <button onClick={handleExcelImportClick} className="p-3 bg-green-700 text-white rounded-2xl shadow-lg shadow-green-200 active:scale-95 transition-transform" title="Importar desde Excel">
                <FileSpreadsheet size={20}/>
            </button>
            <input
                type="file"
                ref={excelFileInputRef}
                onChange={handleFileExcelImport}
                className="hidden"
                accept=".xlsx, .xls"
            />
            <button onClick={handleImportClick} className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-transform" title="Importar desde JSON">
                <FileUp size={20}/>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                className="hidden"
                accept=".json"
            />
            <button onClick={() => setShowAddEmployeeModal(true)} className="p-3 bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-transform" title="Agregar Empleado">
                <UserPlus size={20}/>
            </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredStaff.map(s => {
            const isEditing = editingStaffId === s.id;
            const assignedShift = shiftSettings.find(sh => sh.id === s.shiftId)!;
            
            const handleAreaChangeForStaff = (staffId: string, newArea: string) => {
                const newPositions = DEPARTMENTS_DATA[newArea] || [];
                updateStaffOverride(staffId, {
                    area: newArea,
                    position: newPositions[0] || ''
                });
            };

            const availablePositionsForStaff = s.area ? DEPARTMENTS_DATA[s.area] : [];

            return (
              <div key={s.id} className={`bg-white rounded-3xl border transition-all duration-300 ${isEditing ? 'border-blue-200 shadow-lg' : 'border-gray-100 shadow-sm'}`}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">{s.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.position} • {s.area}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingStaffId(isEditing ? null : s.id)}
                    className={`p-2 rounded-xl transition-colors ${isEditing ? 'bg-blue-700 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    {isEditing ? <ChevronUp size={18} /> : <SlidersHorizontal size={18} />}
                  </button>
                </div>

                {isEditing && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-50 space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Beneficios y Puesto</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Días Vacaciones</label>
                            <input 
                                type="number" 
                                value={s.vacationDays}
                                onChange={(e) => updateStaffOverride(s.id, { vacationDays: parseInt(e.target.value) || 0 })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-blue-700 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Días Sindicato</label>
                            <input 
                                type="number" 
                                value={s.sindicalDays}
                                onChange={(e) => updateStaffOverride(s.id, { sindicalDays: parseInt(e.target.value) || 0 })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-emerald-700 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Área</label>
                            <select value={s.area} onChange={(e) => handleAreaChangeForStaff(s.id, e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none">
                                {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Puesto</label>
                            <select value={s.position} onChange={(e) => updateStaffOverride(s.id, { position: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none" disabled={!s.area}>
                                {availablePositionsForStaff.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Privilegios</p>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nivel de Autorización</label>
                        <select 
                            value={s.role === UserRole.MANAGER ? 'autoriza' : 'no_autoriza'}
                            onChange={(e) => {
                                const isManager = e.target.value === 'autoriza';
                                const newRole = isManager ? UserRole.MANAGER : UserRole.WORKER;
                                const updates: Partial<User> = { role: newRole };
                                
                                if (!isManager) {
                                    updates.authorizes = [];
                                } else if (!s.authorizes || s.authorizes.length === 0) {
                                    updates.authorizes = [s.area]; // Default to own area
                                }
                                updateStaffOverride(s.id, updates);
                            }}
                            disabled={s.role === UserRole.ADMIN_RH}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none mb-4"
                        >
                            <option value="no_autoriza">No Autoriza</option>
                            <option value="autoriza">Autoriza</option>
                        </select>
                        {s.role === UserRole.ADMIN_RH && <p className="text-xs text-gray-400 -mt-2 mb-4">El rol de Admin RH no se puede modificar aquí.</p>}
                      </div>

                      {s.role === UserRole.MANAGER && (
                          <div className="animate-in fade-in duration-300">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Áreas que autoriza</label>
                              <div className="max-h-32 overflow-y-auto bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
                                  {AREAS.map(area => (
                                      <label key={area} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                          <input
                                              type="checkbox"
                                              checked={s.authorizes?.includes(area) || false}
                                              onChange={(e) => handleAuthorizationChange(s.id, area, e.target.checked)}
                                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                          />
                                          {area}
                                      </label>
                                  ))}
                              </div>
                          </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ajustes de Turno</p>
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Turno Asignado</label>
                          <select 
                              value={s.shiftId} 
                              onChange={(e) => updateStaffOverride(s.id, { shiftId: e.target.value })} 
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none mb-4"
                          >
                              {shiftSettings.map(shift => <option key={shift.id} value={shift.id}>{shift.name}</option>)}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Hora Entrada (Opc)</label>
                              <input 
                                  type="time" 
                                  value={s.customStartTime || ''}
                                  onChange={(e) => updateStaffOverride(s.id, { customStartTime: e.target.value || undefined })}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                              />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Hora Salida (Opc)</label>
                              <input 
                                  type="time" 
                                  value={s.customEndTime || ''}
                                  onChange={(e) => updateStaffOverride(s.id, { customEndTime: e.target.value || undefined })}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                              />
                          </div>
                      </div>

                      {assignedShift?.cycleType === ShiftCycleType.WEEKLY && (
                          <div className="mt-4">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Día Descanso (Opc)</label>
                              <select 
                                  value={s.customRestDay ?? assignedShift.restDay}
                                  onChange={(e) => updateStaffOverride(s.id, { customRestDay: parseInt(e.target.value) })}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                              >
                                  {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day, index) => (
                                      <option key={index} value={index}>{day}</option>
                                  ))}
                              </select>
                          </div>
                      )}
                      <button 
                        onClick={() => updateStaffOverride(s.id, { customStartTime: undefined, customEndTime: undefined, customRestDay: undefined })}
                        className="text-xs text-gray-400 hover:text-red-500 font-bold flex items-center gap-1.5 mt-4 transition-colors"
                      >
                          <RotateCcw size={12}/> Restablecer a turno base
                      </button>
                    </div>

                    <button 
                      onClick={() => setEditingStaffId(null)}
                      className="w-full bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 flex items-center justify-center gap-2 mt-4"
                    >
                      <Save size={18} /> Guardar Ajustes
                    </button>
                    
                    <div className="border-t border-gray-100 mt-5 pt-5 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => handleResetPassword(s.id, s.name)}
                            className="flex-1 bg-amber-50 text-amber-700 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <KeyRound size={14} /> Restablecer Contraseña
                        </button>
                        <button
                            onClick={() => openDeleteConfirmation(s.id, s.name)}
                            className="flex-1 bg-red-50 text-red-600 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <Trash2 size={14} /> Eliminar Empleado
                        </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!user) return null;
    
    const assignedShift = shiftSettings.find(s => s.id === user.shiftId);
    const startTime = user.customStartTime || assignedShift?.startTime;
    const endTime = user.customEndTime || assignedShift?.endTime;
    const isBirthday = isBirthdayToday(user.birthDate);
    const seniority = getSeniorityYears(user.hireDate);
    const isAnniversary = isWorkAnniversaryToday(user.hireDate) && seniority > 0;

    const userRequests = requests.filter(r => r.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const pendingUserRequests = userRequests.filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.APPROVED_MANAGER).length;
    const approvedUserRequests = userRequests.filter(r => r.status === RequestStatus.APPROVED_HR).length;
    
    const usedPassMinutes = getUsedPassMinutesThisMonth(userRequests);
    const availablePassMinutes = 120 - usedPassMinutes;

    const getSimpleStatus = (status: RequestStatus): {label: string, color: string} => {
      switch(status) {
        case RequestStatus.APPROVED_HR:
          return { label: 'Aprobado', color: 'bg-emerald-100 text-emerald-800' };
        case RequestStatus.REJECTED:
          return { label: 'Rechazado', color: 'bg-red-100 text-red-800' };
        default:
          return { label: 'En Proceso', color: 'bg-amber-100 text-amber-800' };
      }
    };

    return (
      <div className="pb-32 pt-8 px-6 animate-in fade-in duration-500">
        {user.role === UserRole.WORKER && (
            <button
                onClick={() => setWorkerView('hub')}
                className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 py-2 px-4 rounded-full mb-6 active:scale-95 transition-transform"
            >
                <ArrowLeft size={16} />
                <span>Volver al Portal Principal</span>
            </button>
        )}
        {isBirthday && (
          <div className="mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-0.5 rounded-3xl shadow-lg animate-pulse">
            <div className="bg-white rounded-[22px] p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center shrink-0">
                <Cake size={28} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 leading-tight flex items-center gap-1.5">
                  ¡Feliz Cumpleaños! <Sparkles size={14} className="text-amber-500" />
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">El Hospital Santa Margarita te desea un excelente día, {user.name.split(' ')[0]}.</p>
              </div>
            </div>
          </div>
        )}

        {isAnniversary && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 p-0.5 rounded-3xl shadow-lg animate-pulse">
            <div className="bg-white rounded-[22px] p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <Award size={28} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 leading-tight flex items-center gap-1.5">
                  ¡Feliz Aniversario! <Sparkles size={14} className="text-yellow-500" />
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">Hoy cumples {seniority} {seniority === 1 ? 'año' : 'años'} con nosotros. ¡Gracias!</p>
              </div>
            </div>
          </div>
        )}

        <header className="flex justify-between items-start mb-8">
          <div>
            <p className="text-gray-500 text-sm font-medium">HSM RRHH</p>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-blue-700 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                {assignedShift?.name}
              </span>
              <span className="text-[10px] text-gray-400 font-bold">{startTime} - {endTime}</span>
            </div>
          </div>
          <button className="p-3 bg-white border border-gray-100 rounded-2xl relative text-gray-600 shadow-sm">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </header>

        <section className="grid grid-cols-2 gap-4 mb-8">
          <StatsCard label="Vacaciones" value={`${user.vacationDays}d`} icon={Calendar} color="bg-blue-600" />
          <StatsCard label="Día Sindical" value={`${user.sindicalDays}d`} icon={Briefcase} color="bg-emerald-500" />
          {user.role !== UserRole.WORKER && (
            <StatsCard label="Faltas" value={user.absences} icon={AlertCircle} color="bg-red-500" />
          )}
          <StatsCard 
            label="Minutos de Pase" 
            value={`${availablePassMinutes}m`} 
            icon={Clock} 
            color="bg-amber-500"
            className={user.role === UserRole.WORKER ? 'col-span-2' : ''}
          />
        </section>

        {(user.role === UserRole.WORKER || user.role === UserRole.MANAGER) && (
          <section className="mb-8">
             <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm">
                <h3 className="font-bold text-base text-gray-800 mb-4">Mis Solicitudes</h3>
                <div className="flex justify-around items-center border-b border-gray-100 pb-4 mb-4">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                           <Loader2 size={24} className="animate-spin" />
                        </div>
                        <p className="font-black text-xl text-gray-900">{pendingUserRequests}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pendientes</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                           <CheckCircle size={24} />
                        </div>
                        <p className="font-black text-xl text-gray-900">{approvedUserRequests}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Aprobadas</p>
                    </div>
                </div>
                <div className="space-y-3">
                  {userRequests.length > 0 ? userRequests.slice(0, 3).map(req => {
                    const statusInfo = getSimpleStatus(req.status);
                    return (
                      <div key={req.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-bold text-gray-700 capitalize">{String(req.type).toLowerCase()}</p>
                          <p className="text-xs text-gray-400 font-medium">{req.startDate}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${statusInfo.color}`}>{statusInfo.label}</span>
                      </div>
                    );
                  }) : (
                    <p className="text-center text-xs text-gray-400 italic py-2">No tienes solicitudes recientes.</p>
                  )}
                </div>
            </div>
          </section>
        )}

        <section className="mb-8">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Nueva Solicitud</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => openRequestForm(RequestType.VACATION)} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col items-center gap-3 hover:bg-gray-50 active:scale-95 transition-all group">
              <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar size={28} />
              </div>
              <span className="text-sm font-bold text-gray-700">Vacaciones</span>
            </button>
            <button onClick={() => openRequestForm(RequestType.PASS_EXIT)} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col items-center gap-3 hover:bg-gray-50 active:scale-95 transition-all group">
              <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <DoorOpen size={28} />
              </div>
              <span className="text-sm font-bold text-gray-700">Solicitar Pase</span>
            </button>
            <button onClick={() => openRequestForm(RequestType.SINDICAL)} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col items-center gap-3 hover:bg-gray-50 active:scale-95 transition-all group">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase size={28} />
              </div>
              <span className="text-sm font-bold text-gray-700">Día Sindical</span>
            </button>
            <button onClick={() => openRequestForm(RequestType.CONVENIO)} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col items-center gap-3 hover:bg-gray-50 active:scale-95 transition-all group">
              <div className="w-14 h-14 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <SlidersHorizontal size={28} />
              </div>
              <span className="text-sm font-bold text-gray-700">Convenio</span>
            </button>
          </div>
        </section>
      </div>
    );
  };
  
  const renderRequestsInbox = () => {
    if (!user) return null;
    let requestsToProcess: RequestRecord[] = [];
    if (user.role === UserRole.ADMIN_RH) {
      requestsToProcess = requests.filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.APPROVED_MANAGER);
    } else if (user.role === UserRole.MANAGER) {
      const authorizedAreas = user.authorizes && user.authorizes.length > 0 ? user.authorizes : [user.area];
      const staffInAuthorizedAreas = staff.filter(s => authorizedAreas.includes(s.area));
      const teamUserIds = staffInAuthorizedAreas.map(s => s.id);
      
      requestsToProcess = requests.filter(r => 
          r.status === RequestStatus.PENDING && 
          teamUserIds.includes(r.userId) &&
          r.userId !== user.id
      );
    }

    return (
      <div className="pb-32 pt-8 px-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <ClipboardList size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bandeja de Entrada</h2>
                <p className="text-gray-500 text-sm">{user.area}</p>
              </div>
          </div>
          <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1.5 rounded-full">
            {requestsToProcess.length} Pendientes
          </span>
        </div>
        <div className="space-y-4">
          {requestsToProcess.length > 0 ? (
            requestsToProcess.map(req => (
              <div key={req.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 animate-in slide-in-from-left duration-300">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{req.userName}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{req.type} • {req.startDate}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 line-clamp-2 italic">"{req.reason}"</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleUpdateRequestStatus(req.id, user.role === UserRole.MANAGER ? RequestStatus.APPROVED_MANAGER : RequestStatus.APPROVED_HR)}
                    className="flex-1 bg-blue-700 text-white py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Check size={14} /> Aprobar
                  </button>
                  <button 
                    onClick={() => handleUpdateRequestStatus(req.id, RequestStatus.REJECTED)}
                    className="flex-1 border border-red-100 text-red-600 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <X size={14} /> Rechazar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-400 font-medium italic">No hay solicitudes pendientes</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderHistoryDashboard = () => {
    if (!user) return null;

    const teamStaff = user.role === UserRole.ADMIN_RH 
      ? staff 
      : staff.filter(s => s.area === user.area);
    const teamUserIds = teamStaff.map(s => s.id);
    const teamRequests = requests.filter(r => teamUserIds.includes(r.userId));

    const calculateDays = (start: string, end: string) => {
        const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const totalVacationsConsumed = teamRequests
      .filter(r => r.type === RequestType.VACATION && r.status === RequestStatus.APPROVED_HR)
      .reduce((acc, r) => acc + calculateDays(r.startDate, r.endDate), 0);

    const totalVacationsAvailable = teamStaff.reduce((acc, s) => acc + s.vacationDays, 0);

    const totalPassMinutes = teamRequests
      .filter(r => (r.type === RequestType.PASS_EXIT || r.type === RequestType.PASS_ENTRY) && r.status !== RequestStatus.REJECTED)
      .reduce((acc, r) => acc + (r.durationMinutes || 0), 0);

    const passCounts: Record<string, number> = {};
    teamRequests
      .filter(r => r.type === RequestType.PASS_EXIT && r.status !== RequestStatus.REJECTED)
      .forEach(r => {
        passCounts[r.userId] = (passCounts[r.userId] || 0) + 1;
      });

    const topPassUsers = Object.entries(passCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => ({
        name: staff.find(s => s.id === userId)?.name || 'Desconocido',
        count,
      }));

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center">
              <BarChart size={20}/>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">Estadísticas del Equipo</h3>
              <p className="text-xs text-gray-400 font-medium">{user.area}</p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                    <Clock size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Pases de Salida/Entrada</p>
                </div>
                <p className="text-3xl font-black text-gray-800">{totalPassMinutes}<span className="text-lg font-bold text-gray-400 ml-1">min</span></p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Plane size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Vacaciones</p>
                </div>
                <p className="text-3xl font-black text-gray-800">{totalVacationsConsumed}<span className="text-lg font-bold text-gray-400">/{totalVacationsAvailable+totalVacationsConsumed}d</span></p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-3">
                <TrendingUp size={14} />
                <p className="text-[10px] font-bold uppercase tracking-wider">Top 5: Pases de Salida</p>
            </div>
            <div className="space-y-2">
                {topPassUsers.length > 0 ? topPassUsers.map((u, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                        <p className="font-bold text-gray-700">{i+1}. {u.name}</p>
                        <p className="text-gray-500 font-black">{u.count} pases</p>
                    </div>
                )) : <p className="text-xs text-gray-400 italic text-center">No hay datos de pases todavía.</p>}
            </div>
        </div>
      </div>
    );
  };
  
  const renderWorkerHub = () => {
    if (!user) return null;
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
        <header className="text-center mb-10">
          <p className="text-gray-500 text-sm font-medium">Portal del Empleado</p>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">{user.name}</h2>
          <p className="text-teal-600 font-bold text-[10px] uppercase tracking-[2px] mt-2">{user.position}</p>
        </header>
        <div className="w-full max-w-sm space-y-5">
            <button 
                onClick={() => setWorkerView('evaluations')}
                className="w-full bg-white border border-gray-100 p-6 rounded-3xl shadow-lg flex flex-col items-center gap-3 active:scale-95 transition-all group"
            >
                <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                    <ClipboardCheck size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Mis Evaluaciones</h3>
                <p className="text-xs text-gray-500 text-center">Responde encuestas y evaluaciones pendientes.</p>
            </button>
            <button 
                onClick={() => setWorkerView('app')}
                className="w-full bg-white border border-gray-100 p-6 rounded-3xl shadow-lg flex flex-col items-center gap-3 active:scale-95 transition-all group"
            >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                    <LayoutGrid size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Portal de Solicitudes</h3>
                <p className="text-xs text-gray-500 text-center">Gestiona tus vacaciones, permisos y consulta tu historial.</p>
            </button>
        </div>
        <button onClick={handleLogout} className="absolute bottom-8 bg-red-50 text-red-600 py-3 px-6 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all">
          <LogOut size={14} /> Cerrar Sesión
        </button>
      </div>
    )
  }

  const renderEvaluationsHub = () => {
    if (!user) return null;
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => setWorkerView('hub')} className="p-2 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-xl text-gray-900">Mis Evaluaciones</h1>
            <p className="text-xs text-gray-500">Selecciona una evaluación para comenzar.</p>
          </div>
        </header>
  
        <main className="flex-1 space-y-4">
          <button 
            onClick={() => setWorkerView('survey_nom035')}
            className="w-full bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left transition-all active:scale-[0.98] hover:bg-blue-50"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Evaluación NOM-035</h3>
              <p className="text-xs text-gray-500">Factores de riesgo psicosocial.</p>
            </div>
          </button>
  
          <button 
            onClick={() => alert('Esta evaluación estará disponible próximamente.')}
            className="w-full bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left transition-all active:scale-[0.98] hover:bg-gray-50"
          >
            <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center">
              <ClipboardPenLine size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-500">Evaluación Inicial</h3>
              <p className="text-xs text-gray-400">A contestar al mes de ingreso. (Próximamente)</p>
            </div>
          </button>
  
          <button 
            onClick={() => setWorkerView('survey_climate')}
            className="w-full bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left transition-all active:scale-[0.98] hover:bg-green-50"
          >
            <div className="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center">
              <Smile size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Clima Laboral</h3>
              <p className="text-xs text-gray-500">Participa en nuestra encuesta anual.</p>
            </div>
          </button>

          <button 
            onClick={() => setWorkerView('survey_performance')}
            className="w-full bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left transition-all active:scale-[0.98] hover:bg-purple-50"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Evaluación del Desempeño</h3>
              <p className="text-xs text-gray-500">Revisión de metas y objetivos.</p>
            </div>
          </button>
        </main>
      </div>
    );
  };

  const renderAppContent = () => (
    <>
      <main>
        {currentTab === 'inicio' && renderDashboard()}
        {currentTab === 'solicitudes' && (user.role === UserRole.MANAGER || user.role === UserRole.ADMIN_RH) && renderRequestsInbox()}
        {currentTab === 'config' && user.role === UserRole.ADMIN_RH && renderConfigPanel()}
        {currentTab === 'historial' && (
          <div className="pb-32 pt-8 px-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Solicitudes</h2>
            
            {(user.role === UserRole.MANAGER || user.role === UserRole.ADMIN_RH) && renderHistoryDashboard()}

            <div className="space-y-4">
              {requests
                .filter(r => (user.role === UserRole.WORKER || user.role === UserRole.MANAGER) ? r.userId === user.id : true)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(req => {
                  const config = getStatusConfig(req.status);
                  
                  const formatDate = (dateStr: string) => {
                      if (!dateStr) return '';
                      const date = new Date(dateStr + 'T00:00:00');
                      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
                  };

                  let details = '';
                  let IconComponent = Calendar;
                  let iconColor = 'text-gray-600 bg-gray-100';

                  switch (req.type) {
                      case RequestType.VACATION:
                          details = req.startDate === req.endDate
                              ? `El ${formatDate(req.startDate)}`
                              : `Del ${formatDate(req.startDate)} al ${formatDate(req.endDate)}`;
                          IconComponent = Calendar;
                          iconColor = 'text-blue-600 bg-blue-50';
                          break;
                      case RequestType.PASS_EXIT:
                      case RequestType.PASS_ENTRY:
                          details = `El ${formatDate(req.startDate)} de ${req.startTime} a ${req.endTime}`;
                          IconComponent = DoorOpen;
                          iconColor = 'text-amber-600 bg-amber-50';
                          break;
                      case RequestType.SINDICAL:
                          details = `El ${formatDate(req.startDate)}`;
                          IconComponent = Briefcase;
                          iconColor = 'text-emerald-600 bg-emerald-50';
                          break;
                      case RequestType.CONVENIO:
                          details = `El ${formatDate(req.startDate)}`;
                          IconComponent = SlidersHorizontal;
                          iconColor = 'text-gray-600 bg-gray-100';
                          break;
                      default:
                          details = `El ${formatDate(req.startDate)}`;
                          break;
                  }

                  return (
                    <div key={req.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconColor}`}>
                          <IconComponent size={24} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-900 text-sm leading-tight capitalize truncate">{String(req.type).toLowerCase()}</h4>
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${config.color} shrink-0 ml-2`}>{config.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-1">{details}</p>
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        )}
        {currentTab === 'perfil' && (
          <div className="pb-32 pt-8 px-6 text-center animate-in slide-in-from-right duration-300">
            <div className="w-24 h-24 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl shadow-teal-50">
              {user.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{user.name}</h3>
            <p className="text-teal-600 font-bold text-[10px] uppercase tracking-[2px] mt-2 mb-10">{user.role} • {user.area}</p>
            <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all">
              <LogOut size={20} /> Cerrar Sesión
            </button>
          </div>
        )}
      </main>

      <Navigation currentTab={currentTab} setTab={setCurrentTab} role={user.role} />
    </>
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="w-14 h-14 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400 animate-pulse font-bold tracking-widest text-[10px] uppercase">Cargando...</p>
    </div>
  );

  if (!user) return renderLogin();

  const renderMainView = () => {
    if (user.role === UserRole.WORKER) {
      switch(workerView) {
        case 'hub':
          return renderWorkerHub();
        case 'evaluations':
          return renderEvaluationsHub();
        case 'survey_nom035':
          return <Nom035Survey onBack={() => setWorkerView('evaluations')} onSubmit={handleSurveySubmit} />;
        case 'survey_performance':
          return <PerformanceEvaluation user={user} onBack={() => setWorkerView('evaluations')} onSubmit={handlePerformanceEvaluationSubmit} />;
        case 'survey_climate':
          return <WorkClimateSurvey user={user} onBack={() => setWorkerView('evaluations')} onSubmit={handleWorkClimateSurveySubmit} />;
        case 'app':
          return renderAppContent();
        default:
          return renderWorkerHub();
      }
    }
    // For MANAGER and ADMIN_RH, always show the app content
    return renderAppContent();
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      {renderMainView()}
      
      {showAddEmployeeModal && <AddEmployeeModal 
          onClose={() => setShowAddEmployeeModal(false)}
          data={newEmployeeData}
          setData={setNewEmployeeData}
          onSubmit={handleAddEmployee}
      />}

      {showRequestForm && (
        <RequestForm 
          user={user} 
          initialType={formInitialType} 
          onClose={() => setShowRequestForm(false)} 
          onSubmit={handleCreateRequest} 
          existingRequests={requests.filter(r => r.userId === user.id)}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteEmployee}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar a ${employeeToDelete?.name}? Esta acción es irreversible.`}
      />
    </div>
  );
}

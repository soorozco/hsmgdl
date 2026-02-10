
import React, { useState } from 'react';
import { User } from '../types';
import { CLIMATE_QUESTIONS, WORK_CLIMATE_SURVEY_SCALE } from '../workClimateSurveyQuestions';
import { AREAS } from '../constants';
import { ArrowLeft, Send } from 'lucide-react';

interface WorkClimateSurveyProps {
  user: User;
  onBack: () => void;
  onSubmit: (answers: any) => void;
}

export const WorkClimateSurvey: React.FC<WorkClimateSurveyProps> = ({ user, onBack, onSubmit }) => {
  const [demographics, setDemographics] = useState({
    department: user.area || '',
    bossName: '',
    gender: '',
    ageRange: '',
    civilStatus: '',
    education: '',
    companySeniority: '',
    positionSeniority: ''
  });
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  const totalQuestions = CLIMATE_QUESTIONS.length;
  const questionsAnswered = Object.keys(answers).length;
  const isComplete = questionsAnswered === totalQuestions && Object.values(demographics).every(field => field !== '');

  const handleDemographicsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDemographics(prev => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (questionIndex: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };
  
  const handleSubmit = () => {
    if (isComplete) {
      onSubmit({ demographics, answers });
    } else {
      alert('Por favor, completa toda la información demográfica y responde todas las preguntas para finalizar.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 p-4 flex items-center gap-4 z-10">
        <button onClick={onBack} className="p-2 text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-gray-900">Encuesta de Clima Laboral</h1>
          <p className="text-xs text-gray-500">Tu opinión es muy importante para nosotros.</p>
        </div>
      </header>

      <main className="p-5 pb-28">
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
            <h2 className="font-black text-lg text-gray-800 mb-4">Información Demográfica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                    <label className="font-bold text-gray-600 text-xs block mb-1">Departamento</label>
                    <select name="department" value={demographics.department} onChange={handleDemographicsChange} className="w-full bg-white border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500">
                        <option value="">Selecciona...</option>
                        {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                    </select>
                </div>
                <div>
                    <label className="font-bold text-gray-600 text-xs block mb-1">Jefe inmediato</label>
                    <input type="text" name="bossName" value={demographics.bossName} onChange={handleDemographicsChange} className="w-full bg-white border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"/>
                </div>
                <div>
                    <label className="font-bold text-gray-600 text-xs block mb-1">Sexo</label>
                    <select name="gender" value={demographics.gender} onChange={handleDemographicsChange} className="w-full bg-white border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500">
                        <option value="">Selecciona...</option>
                        <option>Masculino</option>
                        <option>Femenino</option>
                        <option>Prefiero no decir</option>
                    </select>
                </div>
                 <div>
                    <label className="font-bold text-gray-600 text-xs block mb-1">Rango de Edad</label>
                    <select name="ageRange" value={demographics.ageRange} onChange={handleDemographicsChange} className="w-full bg-white border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500">
                        <option value="">Selecciona...</option>
                        <option>18-25</option>
                        <option>26-35</option>
                        <option>36-45</option>
                        <option>46-55</option>
                        <option>56+</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="space-y-6">
          {CLIMATE_QUESTIONS.map((question, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm font-bold text-gray-700 mb-3">{`${index + 1}. ${question}`}</p>
              <div className="flex flex-wrap justify-between gap-y-2 gap-x-2">
                {WORK_CLIMATE_SURVEY_SCALE.map((option, value) => (
                  <label key={value} className="flex items-center space-x-2 text-[11px] font-bold cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={value}
                      checked={answers[index] === value}
                      onChange={() => handleAnswerChange(index, value)}
                      className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] safe-area-bottom">
        <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500">Progreso</p>
            <p className="text-xs font-bold text-gray-900">{questionsAnswered} / {totalQuestions}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${(questionsAnswered / totalQuestions) * 100}%` }}></div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full bg-green-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          {isComplete ? 'Finalizar y Enviar' : 'Completa todo para continuar'}
        </button>
      </footer>
    </div>
  );
};

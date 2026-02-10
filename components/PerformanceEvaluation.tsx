
import React, { useState } from 'react';
import { User } from '../types';
import { PERFORMANCE_EVALUATION_QUESTIONS, PERFORMANCE_EVALUATION_SCALE } from '../performanceEvaluationQuestions';
import { ArrowLeft, Send } from 'lucide-react';

interface PerformanceEvaluationProps {
  user: User;
  onBack: () => void;
  onSubmit: (answers: any) => void;
}

export const PerformanceEvaluation: React.FC<PerformanceEvaluationProps> = ({ user, onBack, onSubmit }) => {
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [openFeedback, setOpenFeedback] = useState({
    strengths: '',
    opportunities: '',
    suggestions: ''
  });

  const totalQuestions = PERFORMANCE_EVALUATION_QUESTIONS.reduce((acc, section) => acc + section.questions.length, 0);
  const questionsAnswered = Object.keys(ratings).length;
  const isComplete = questionsAnswered === totalQuestions;

  const handleRatingChange = (questionIndex: number, sectionIndex: number, value: number) => {
    setRatings(prev => ({ ...prev, [`${sectionIndex}-${questionIndex}`]: value }));
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOpenFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (isComplete) {
      onSubmit({ ratings, ...openFeedback });
    } else {
      alert('Por favor, califica todas las competencias antes de finalizar.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 p-4 flex items-center gap-4 z-10">
        <button onClick={onBack} className="p-2 text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-gray-900">Evaluación de Desempeño</h1>
          <p className="text-xs text-gray-500">Revisión de Competencias 360º</p>
        </div>
      </header>

      <main className="p-5 pb-28">
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Evaluado</p>
                <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Fecha</p>
                <p className="text-xs font-bold text-gray-800">{new Date().toLocaleDateString('es-MX')}</p>
            </div>
        </div>

        {PERFORMANCE_EVALUATION_QUESTIONS.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h2 className="font-black text-lg text-gray-800 mb-4">{section.category}</h2>
            <div className="space-y-6">
              {section.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-sm font-bold text-gray-700 mb-3">{`${question}`}</p>
                  <div className="flex flex-wrap justify-between gap-y-2 gap-x-3">
                    {PERFORMANCE_EVALUATION_SCALE.map((option, value) => (
                      <label key={value} className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${sectionIndex}-${questionIndex}`}
                          value={value + 1}
                          checked={ratings[`${sectionIndex}-${questionIndex}`] === (value + 1)}
                          onChange={() => handleRatingChange(questionIndex, sectionIndex, value + 1)}
                          className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="font-black text-lg text-gray-800 mb-4">Retroalimentación Adicional</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Fortalezas</label>
                    <textarea name="strengths" value={openFeedback.strengths} onChange={handleFeedbackChange} rows={3} placeholder="Identifica 2-3 fortalezas clave..." className="w-full text-sm bg-gray-50 border-gray-200 rounded-xl p-3 focus:ring-purple-500 focus:border-purple-500"></textarea>
                </div>
                 <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Áreas de Oportunidad</label>
                    <textarea name="opportunities" value={openFeedback.opportunities} onChange={handleFeedbackChange} rows={3} placeholder="¿En qué áreas puede mejorar?" className="w-full text-sm bg-gray-50 border-gray-200 rounded-xl p-3 focus:ring-purple-500 focus:border-purple-500"></textarea>
                </div>
                 <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Sugerencias</label>
                    <textarea name="suggestions" value={openFeedback.suggestions} onChange={handleFeedbackChange} rows={3} placeholder="Sugerencias para su desarrollo profesional y personal." className="w-full text-sm bg-gray-50 border-gray-200 rounded-xl p-3 focus:ring-purple-500 focus:border-purple-500"></textarea>
                </div>
            </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] safe-area-bottom">
        <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500">Progreso</p>
            <p className="text-xs font-bold text-gray-900">{questionsAnswered} / {totalQuestions}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${(questionsAnswered / totalQuestions) * 100}%` }}></div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full bg-purple-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          {isComplete ? 'Finalizar y Enviar' : 'Responde todo para continuar'}
        </button>
      </footer>
    </div>
  );
};


import React, { useState } from 'react';
import { NOM035_QUESTIONS, IQuestionSection } from '../nom035Questions';
import { ArrowLeft, Send } from 'lucide-react';

interface Nom035SurveyProps {
  onBack: () => void;
  onSubmit: (answers: { [key: number]: number }) => void;
}

const options = ["Siempre", "Casi siempre", "Algunas veces", "Casi nunca", "Nunca"];

export const Nom035Survey: React.FC<Nom035SurveyProps> = ({ onBack, onSubmit }) => {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  const totalQuestions = NOM035_QUESTIONS.reduce((acc, section) => acc + section.questions.length, 0);

  const handleAnswerChange = (questionIndex: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const isComplete = Object.keys(answers).length === totalQuestions;

  const handleSubmit = () => {
    if (isComplete) {
      onSubmit(answers);
    } else {
      alert('Por favor, responde todas las preguntas antes de finalizar.');
    }
  };

  let globalQuestionIndex = 0;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 p-4 flex items-center gap-4 z-10">
        <button onClick={onBack} className="p-2 text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-gray-900">Evaluación NOM-035</h1>
          <p className="text-xs text-gray-500">Identificación de Factores de Riesgo Psicosocial</p>
        </div>
      </header>

      <main className="p-5 pb-28">
        <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-2xl mb-6">
          <p className="text-xs font-semibold">Las siguientes preguntas permiten identificar las condiciones en su centro de trabajo que podrían representar un riesgo para su salud. Por favor, conteste seleccionando la opción que mejor describa su situación.</p>
        </div>

        {NOM035_QUESTIONS.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h2 className="font-black text-lg text-gray-800 mb-1">{section.section}</h2>
            <p className="text-xs text-gray-500 mb-4">{section.instructions}</p>
            <div className="space-y-6">
              {section.questions.map((question, questionInSectionIndex) => {
                const currentIndex = globalQuestionIndex++;
                return (
                  <div key={currentIndex} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-bold text-gray-700 mb-3">{`${currentIndex + 1}. ${question}`}</p>
                    <div className="flex flex-wrap justify-between gap-2">
                      {options.map((option, value) => (
                        <label key={value} className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${currentIndex}`}
                            value={options.length - 1 - value}
                            checked={answers[currentIndex] === (options.length - 1 - value)}
                            onChange={() => handleAnswerChange(currentIndex, options.length - 1 - value)}
                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] safe-area-bottom">
        <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500">Progreso</p>
            <p className="text-xs font-bold text-gray-900">{Object.keys(answers).length} / {totalQuestions}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(Object.keys(answers).length / totalQuestions) * 100}%` }}></div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          {isComplete ? 'Finalizar y Enviar' : 'Responde todo para continuar'}
        </button>
      </footer>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { QUESTIONS, LIKERT_OPTIONS } from '../constants';
import { type Scores, type QuestionCategory } from '../types';

interface QuestionnaireProps {
  onComplete: (scores: Scores) => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const currentQuestion = useMemo(() => QUESTIONS[currentQuestionIndex], [currentQuestionIndex]);
  const progress = useMemo(() => ((currentQuestionIndex) / QUESTIONS.length) * 100, [currentQuestionIndex]);

  const handleAnswerSelect = (questionId: number, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        calculateScores(newAnswers);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScores = (finalAnswers: Record<number, number>) => {
    const scores: Scores = { self: 0, others: 0, object: 0, situation: 0 };
    
    QUESTIONS.forEach(question => {
      let score = finalAnswers[question.id] || 3; // Default to neutral if not answered
      if (question.isReversed) {
        score = 6 - score;
      }
      scores[question.category] += score;
    });

    onComplete(scores);
  };

  return (
    <div className="bg-surface p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg w-full animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-primary">질문 {currentQuestionIndex + 1}/{QUESTIONS.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="text-center min-h-[100px] flex items-center justify-center mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-on-surface animate-slide-in" key={currentQuestion.id}>
          {currentQuestion.text}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 md:gap-5">
        {LIKERT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleAnswerSelect(currentQuestion.id, value)}
            className={`p-3 md:py-4 rounded-lg text-center font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${answers[currentQuestion.id] === value 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-gray-100 hover:bg-gray-200 text-on-surface-variant focus:ring-primary'}`}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div className="mt-8 flex justify-start">
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="bg-gray-200 text-on-surface-variant hover:bg-gray-300 font-semibold py-2 px-5 rounded-full transition-colors duration-200 flex items-center"
            aria-label="이전 질문으로 돌아가기"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            이전
          </button>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;
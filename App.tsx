
import React, { useState, useCallback } from 'react';
import StartScreen from './components/StartScreen';
import Questionnaire from './components/Questionnaire';
import ResultsScreen from './components/ResultsScreen';
import { type Scores } from './types';

type AppState = 'start' | 'in-progress' | 'completed';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('start');
  const [finalScores, setFinalScores] = useState<Scores | null>(null);

  const handleStartTest = useCallback(() => {
    setAppState('in-progress');
  }, []);

  const handleTestComplete = useCallback((scores: Scores) => {
    setFinalScores(scores);
    setAppState('completed');
  }, []);

  const handleRetake = useCallback(() => {
    setFinalScores(null);
    setAppState('start');
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'in-progress':
        return <Questionnaire onComplete={handleTestComplete} />;
      case 'completed':
        return finalScores && <ResultsScreen scores={finalScores} onRetake={handleRetake} />;
      case 'start':
      default:
        return <StartScreen onStart={handleStartTest} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <main className="w-full max-w-2xl md:max-w-3xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
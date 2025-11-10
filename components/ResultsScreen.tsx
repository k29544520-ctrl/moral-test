
import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend } from 'recharts';
import { type Scores, type CombinedScores, type ResultDescriptions } from '../types';
import { generateResultDescriptions } from '../services/geminiService';

interface ResultsScreenProps {
  scores: Scores;
  onRetake: () => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
  </div>
);

const ResultsScreen: React.FC<ResultsScreenProps> = ({ scores, onRetake }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [descriptions, setDescriptions] = useState<ResultDescriptions | null>(null);

  const combinedScores: CombinedScores = useMemo(() => ({
    selfObject: scores.self + scores.object,
    othersObject: scores.others + scores.object,
    selfSituation: scores.self + scores.situation,
    othersSituation: scores.others + scores.situation,
  }), [scores]);

  const primaryProfile = useMemo(() => {
    const profileMap: { [key in keyof CombinedScores]: string } = {
        selfObject: '자신-대상형',
        othersObject: '타인-대상형',
        selfSituation: '자신-상황형',
        othersSituation: '타인-상황형',
    };

    if (!combinedScores) return { name: '분석 중...' };

    const [highestKey] = Object.entries(combinedScores).reduce(
      (acc, [key, value]) => (value > acc[1] ? [key, value] : acc),
      ['', -1]
    );
    
    return {
      name: profileMap[highestKey as keyof CombinedScores] || '알 수 없음',
    };
  }, [combinedScores]);


  useEffect(() => {
    const fetchDescriptions = async () => {
      setIsLoading(true);
      const fetchedDescriptions = await generateResultDescriptions(combinedScores);
      setDescriptions(fetchedDescriptions);
      setIsLoading(false);
    };
    fetchDescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = [
    { type: '자신-대상', score: combinedScores.selfObject, fullMark: 80 },
    { type: '타인-대상', score: combinedScores.othersObject, fullMark: 80 },
    { type: '타인-상황', score: combinedScores.othersSituation, fullMark: 80 },
    { type: '자신-상황', score: combinedScores.selfSituation, fullMark: 80 },
  ];

  return (
    <div className="bg-surface p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg w-full animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold text-on-surface text-center mb-2">공감 프로필 결과</h1>
      <p className="text-on-surface-variant text-center mb-6">당신의 공감 유형에 대한 분석입니다.</p>
      
      <div className="text-center mb-8 p-4 md:p-6 bg-emerald-50 border-l-4 border-secondary rounded-r-lg animate-slide-in">
          <p className="text-on-surface-variant text-md md:text-lg">당신의 주요 공감 프로필은</p>
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mt-1">{primaryProfile.name}</h2>
      </div>

      <div className="w-full h-80 sm:h-96 md:h-[28rem] mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="type" tick={{ fill: '#374151', fontSize: 14 }} />
            <Radar name="공감 점수" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          descriptions && (
            <>
              <ResultCard title="자신과 대상" description={descriptions.selfObject} />
              <ResultCard title="타인과 대상" description={descriptions.othersObject} />
              <ResultCard title="자신과 상황" description={descriptions.selfSituation} />
              <ResultCard title="타인과 상황" description={descriptions.othersSituation} />
            </>
          )
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onRetake}
          className="w-full sm:w-auto bg-secondary text-white font-bold py-3 px-10 rounded-full hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-secondary/30 transition-all duration-300 transform hover:scale-105"
        >
          다시 검사하기
        </button>
      </div>
    </div>
  );
};

interface ResultCardProps {
    title: string;
    description: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, description }) => (
    <div className="bg-gray-50 p-4 md:p-5 rounded-lg border border-gray-200 animate-slide-in">
        <h3 className="font-bold text-lg md:text-xl text-primary-dark mb-1">{title}</h3>
        <p className="text-on-surface-variant">{description}</p>
    </div>
);

export default ResultsScreen;
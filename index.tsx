
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend } from 'recharts';

// --- Types (from types.ts) ---
type QuestionCategory = 'self' | 'others' | 'object' | 'situation';

interface Question {
  id: number;
  text: string;
  category: QuestionCategory;
  isReversed?: boolean;
}

interface Scores {
  self: number;
  others: number;
  object: number;
  situation: number;
}

interface CombinedScores {
  selfObject: number;
  othersObject: number;
  selfSituation: number;
  othersSituation: number;
}

interface ResultDescriptions {
    selfObject: string;
    othersObject: string;
    selfSituation: string;
    othersSituation: string;
}

// --- Constants (from constants.ts) ---
const QUESTIONS: Question[] = [
  // Self
  { id: 1, text: '내가 화가 날 때 왜 화가 났는지 스스로 생각해 본다.', category: 'self' },
  { id: 2, text: '내가 어떤 일을 잘할 수 있을지 자주 생각해 본다.', category: 'self' },
  { id: 3, text: '힘든 일이 생겨도 혼자 이겨내려고 노력한다.', category: 'self' },
  { id: 4, text: '내가 기분이 좋을 때 그 이유를 알 수 있다.', category: 'self' },
  { id: 5, text: '실수했을 때 “괜찮아, 다시 하면 돼.”라고 스스로 위로한다.', category: 'self' },
  { id: 6, text: '내가 한 행동이 옳았는지 스스로 되돌아본다.', category: 'self' },
  { id: 7, text: '내가 느끼는 감정을 말로 표현하는 게 어렵다.', category: 'self', isReversed: true },
  { id: 8, text: '나만의 생각이나 느낌을 존중하는 편이다.', category: 'self' },
  // Others
  { id: 9, text: '친구가 기분이 나빠 보이면 이유를 알고 싶다.', category: 'others' },
  { id: 10, text: '친구가 슬퍼하면 나도 같이 슬퍼진다.', category: 'others' },
  { id: 11, text: '친구가 실수해도 이해하려고 한다.', category: 'others' },
  { id: 12, text: '친구가 칭찬받으면 나도 기분이 좋다.', category: 'others' },
  { id: 13, text: '친구가 화가 나 있으면 먼저 말을 걸기 어렵다.', category: 'others', isReversed: true },
  { id: 14, text: '친구가 아플 때 도와주고 싶다.', category: 'others' },
  { id: 15, text: '친구가 속상한 일을 말하면 끝까지 들어준다.', category: 'others' },
  { id: 16, text: '친구가 곤란할 때 도와줄 방법을 떠올린다.', category: 'others' },
  // Object
  { id: 17, text: '식물이 시들면 “물 줘야겠다.”는 생각이 든다.', category: 'object' },
  { id: 18, text: '동물이 다치면 마음이 아프다.', category: 'object' },
  { id: 19, text: '내가 아끼는 물건이 망가지면 속상하다.', category: 'object' },
  { id: 20, text: '내가 만든 작품을 보면 뿌듯한 기분이 든다.', category: 'object' },
  { id: 21, text: '버려진 물건을 보면 “불쌍하다”는 생각이 든다.', category: 'object' },
  { id: 22, text: '친구가 아끼는 물건을 조심히 다룬다.', category: 'object' },
  { id: 23, text: '쓰레기를 보면 그냥 지나치지 않고 주워 버린다.', category: 'object' },
  { id: 24, text: '내가 자주 쓰는 물건에도 ‘감정이 있을 것 같다’고 느낀다.', category: 'object' },
  // Situation
  { id: 25, text: '친구가 혼날 때 나도 긴장되거나 걱정된다.', category: 'situation' },
  { id: 26, text: '누군가 다투면 어떻게 하면 화해할 수 있을지 생각한다.', category: 'situation' },
  { id: 27, text: '발표나 경쟁 상황에서 다른 사람의 긴장감을 이해한다.', category: 'situation' },
  { id: 28, text: '모두가 힘든 상황이면 나도 조용히 도와주려고 한다.', category: 'situation' },
  { id: 29, text: '누군가 놀림을 받을 때 그만하라고 말하고 싶다.', category: 'situation' },
  { id: 30, text: '내가 잘못한 상황이면 먼저 사과하는 게 맞다고 생각한다.', category: 'situation' },
];

const LIKERT_OPTIONS = [
  { value: 1, label: '전혀 그렇지 않다' },
  { value: 2, label: '그렇지 않다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '그렇다' },
  { value: 5, label: '매우 그렇다' },
];

// --- Services (from services/geminiService.ts) ---
let ai: GoogleGenAI | null = null;
let apiKeyError: string | null = null;

try {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API_KEY 환경 변수가 설정되지 않았습니다. 앱이 올바르게 작동하려면 API 키가 필요합니다.");
  }
  ai = new GoogleGenAI({ apiKey: API_KEY });
} catch (e) {
  console.error(e);
  apiKeyError = e instanceof Error ? e.message : "알 수 없는 API 키 초기화 오류가 발생했습니다.";
}

const resultSchema = {
    type: Type.OBJECT,
    properties: {
        selfObject: {
            type: Type.STRING,
            description: "자신과 대상 관계에 대한 분석. 자기 성찰과 사물/환경에 대한 공감 능력의 상호작용을 설명합니다."
        },
        othersObject: {
            type: Type.STRING,
            description: "타인과 대상 관계에 대한 분석. 타인에 대한 공감 능력이 주변 환경과 사물에 대한 관심으로 어떻게 확장되는지 설명합니다."
        },
        selfSituation: {
            type: Type.STRING,
            description: "자신과 상황 관계에 대한 분석. 특정 상황 속에서 자신의 감정과 역할을 어떻게 인식하고 대처하는지 설명합니다."
        },
        othersSituation: {
            type: Type.STRING,
            description: "타인과 상황 관계에 대한 분석. 사회적 상황 속에서 타인의 감정을 이해하고 그에 맞춰 행동하는 능력을 설명합니다."
        }
    },
    required: ["selfObject", "othersObject", "selfSituation", "othersSituation"]
};

const generateResultDescriptions = async (scores: CombinedScores): Promise<ResultDescriptions> => {
    const defaultErrorResult = {
        selfObject: "결과를 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        othersObject: "결과를 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        selfSituation: "결과를 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        othersSituation: "결과를 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    };

    if (!ai) {
        console.error("Gemini AI client is not initialized.");
        return defaultErrorResult;
    }

    const prompt = `
    다음은 공감 프로필 검사 결과입니다. 각 점수는 16점에서 80점 사이입니다. 점수가 높을수록 해당 영역의 공감 능력이 높다는 것을 의미합니다.
    각 항목에 대해 점수를 기반으로 심리학적 분석 결과를 1~2문장으로, 긍정적이고 격려하는 톤으로 작성해주세요.

    결과 점수:
    - 자신과 대상 관계 (Self & Object): ${scores.selfObject}점
    - 타인과 대상 관계 (Others & Object): ${scores.othersObject}점
    - 자신과 상황 관계 (Self & Situation): ${scores.selfSituation}점
    - 타인과 상황 관계 (Others & Situation): ${scores.othersSituation}점

    아래 JSON 스키마 형식에 맞춰 응답해주세요.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: resultSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as ResultDescriptions;

    } catch (error) {
        console.error("Error generating result descriptions:", error);
        return defaultErrorResult;
    }
};

// --- Component: StartScreen ---
const StartScreen: React.FC<{ onStart: () => void; }> = ({ onStart }) => {
  return (
    <div className="bg-surface p-8 md:p-12 rounded-2xl shadow-lg w-full text-center animate-fade-in">
      <div className="mb-6">
        <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-3">나의 공감 프로필 찾기</h1>
      <p className="text-on-surface-variant mb-8 md:mb-10 max-w-md mx-auto md:text-lg">
        자신의 유형을 알아봅시다
      </p>
      <button
        onClick={onStart}
        className="w-full sm:w-auto bg-primary text-white font-bold py-3 px-10 md:py-4 md:px-12 rounded-full hover:bg-primary-light focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 transform hover:scale-105"
      >
        검사 시작하기
      </button>
    </div>
  );
};

// --- Component: Questionnaire ---
const Questionnaire: React.FC<{ onComplete: (scores: Scores) => void; }> = ({ onComplete }) => {
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

// --- Component: ResultsScreen ---
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
  </div>
);

const ResultCard: React.FC<{ title: string; description: string; }> = ({ title, description }) => (
    <div className="bg-gray-50 p-4 md:p-5 rounded-lg border border-gray-200 animate-slide-in">
        <h3 className="font-bold text-lg md:text-xl text-primary-dark mb-1">{title}</h3>
        <p className="text-on-surface-variant">{description}</p>
    </div>
);

const ResultsScreen: React.FC<{ scores: Scores; onRetake: () => void; }> = ({ scores, onRetake }) => {
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

// --- Component: App ---
type AppState = 'start' | 'in-progress' | 'completed';

const App: React.FC = () => {
  if (apiKeyError) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-red-50">
            <main className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg border-2 border-red-300">
                <h1 className="text-2xl font-bold text-red-800 mb-4">어플리케이션 오류</h1>
                <p className="text-red-700">
                    앱을 초기화하는 중 심각한 오류가 발생했습니다.
                </p>
                <div className="mt-4 p-4 bg-red-100 text-red-900 rounded">
                    <strong>오류 메시지:</strong> {apiKeyError}
                </div>
                <p className="mt-4 text-gray-600">
                    이 문제를 해결하려면 환경 설정에서 API 키가 올바르게 구성되었는지 확인하세요.
                </p>
            </main>
        </div>
    );
  }
    
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


// --- App Entry Point (original index.tsx) ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
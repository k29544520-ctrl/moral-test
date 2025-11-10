
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
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

export default StartScreen;
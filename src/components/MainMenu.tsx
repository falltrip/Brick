import React, { useEffect, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { X } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const { playSound } = useAudio();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    playSound('menuMusic', true);
    return () => {
      // Stop menu music when component unmounts
    };
  }, [playSound]);

  const handleStart = () => {
    playSound('buttonClick');
    onStart();
  };

  const toggleHowToPlay = () => {
    playSound('buttonClick');
    setShowHowToPlay(!showHowToPlay);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <div className="flex-1" />
      
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-transparent bg-clip-text">
          Brick Breaker
        </h1>
      </div>
      
      <div className="space-y-6 w-full max-w-xs mb-8">
        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full text-xl font-bold hover:from-cyan-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-lg"
        >
          Play Game
        </button>
        
        <button
          onClick={toggleHowToPlay}
          className="w-full py-3 bg-white/70 backdrop-blur-sm text-teal-700 rounded-full text-lg font-semibold hover:bg-white transition-all transform hover:scale-102 shadow"
        >
          How to Play
        </button>
      </div>
      
      <div className="flex-1" />
      
      <div className="text-center text-teal-700 font-medium">
        <p>© 2025 Brick Breaker</p>
        <p className="text-sm">All rights reserved</p>
      </div>

      {showHowToPlay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button
              onClick={toggleHowToPlay}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-teal-800 mb-4">게임 방법</h2>
            
            <div className="space-y-3 text-left text-gray-700">
              <p>
                <strong>조작 방법:</strong>
                <br />
                - 키보드: 좌우 방향키 또는 A/D 키
                <br />
                - 마우스: 패들을 좌우로 이동
              </p>
              
              <p>
                <strong>게임 규칙:</strong>
                <br />
                - 공을 패들로 튕겨서 블록을 파괴하세요
                - 모든 블록을 파괴하면 다음 레벨로 진행
                - 공을 놓치면 생명력이 감소
                - 파워업 아이템을 획득하여 유리한 게임 진행
              </p>
              
              <p>
                <strong>파워업 효과:</strong>
                <br />
                - ♥: 생명력 +1
                - ↔: 패들 크기 증가
                - ●●: 멀티볼
                - ⊝: 공 속도 감소
                - ⚡: 공 속도 증가
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
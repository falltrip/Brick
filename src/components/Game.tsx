import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { GameEngine } from '../game/GameEngine';
import { Heart, Pause, Home } from 'lucide-react';

interface GameProps {
  level: number;
  onGameOver: (score: number) => void;
  onBackToMenu: () => void;
}

const Game: React.FC<GameProps> = ({ level, onGameOver, onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { playSound } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const container = canvas.parentElement;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        
        if (gameEngineRef.current) {
          gameEngineRef.current.resize(width, height);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const gameEngine = new GameEngine(canvas, level, {
      onScoreChange: (newScore) => setScore(newScore),
      onLifeLost: () => {
        playSound('lifeLost');
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            gameEngine.stop();
            onGameOver(score);
          }
          return newLives;
        });
      },
      onLevelComplete: () => {
        playSound('levelComplete');
        // Handle level completion
      },
      onPowerUpCollected: (type) => {
        playSound('powerUp');
        if (type === 'extraLife') {
          setLives((prev) => prev + 1);
        }
      }
    });
    gameEngineRef.current = gameEngine;

    gameEngine.start();
    playSound('bgMusic', true);

    return () => {
      window.removeEventListener('resize', handleResize);
      gameEngine.stop();
    };
  }, [level, onGameOver, score, playSound]);

  const togglePause = () => {
    if (gameEngineRef.current) {
      if (isPaused) {
        gameEngineRef.current.resume();
      } else {
        gameEngineRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const handleBackClick = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
    }
    onBackToMenu();
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex justify-between items-center p-4 bg-white/50 backdrop-blur-sm rounded-t-lg">
        <div className="flex items-center gap-2">
          {Array.from({ length: lives }).map((_, i) => (
            <Heart key={i} className="w-6 h-6 text-red-500 fill-red-500" />
          ))}
        </div>
        <div className="text-2xl font-bold text-purple-800">
          Score: {score}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={togglePause}
            className="w-10 h-10 flex items-center justify-center bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
          >
            <Pause className="w-5 h-5" />
          </button>
          <button 
            onClick={handleBackClick}
            className="w-10 h-10 flex items-center justify-center bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-grow relative">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 bg-gradient-to-b from-blue-100 to-purple-100"
        />
      </div>

      {isPaused && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-bold text-purple-800 mb-4">Paused</h2>
            <button 
              onClick={togglePause}
              className="px-6 py-3 bg-purple-500 text-white rounded-full text-lg font-semibold hover:bg-purple-600 transition-colors"
            >
              Resume Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
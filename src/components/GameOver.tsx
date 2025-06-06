import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Frown, Trophy } from 'lucide-react';

interface GameOverProps {
  score: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onPlayAgain, onBackToMenu }) => {
  const { playSound } = useAudio();

  React.useEffect(() => {
    playSound('gameOver');
  }, [playSound]);

  const handlePlayAgain = () => {
    playSound('buttonClick');
    onPlayAgain();
  };

  const handleBackToMenu = () => {
    playSound('buttonClick');
    onBackToMenu();
  };

  // Check if this is a high score
  const highScore = parseInt(localStorage.getItem('kawaiiBreaker_highScore') || '0');
  const isNewHighScore = score > highScore;
  
  if (isNewHighScore) {
    localStorage.setItem('kawaiiBreaker_highScore', score.toString());
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-purple-200/70 to-pink-200/70 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
        <div className="mb-4">
          {isNewHighScore ? (
            <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
          ) : (
            <Frown className="w-16 h-16 mx-auto text-purple-500" />
          )}
        </div>
        
        <h2 className="text-3xl font-bold text-purple-800 mb-2">
          Game Over
        </h2>
        
        {isNewHighScore && (
          <div className="text-xl font-bold text-yellow-600 mb-4">
            New High Score!
          </div>
        )}
        
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 mb-6">
          <p className="text-lg font-medium text-purple-700">Your Score</p>
          <p className="text-4xl font-bold text-purple-800">{score}</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handlePlayAgain}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-lg font-bold hover:from-pink-600 hover:to-purple-600 transition-all shadow-md"
          >
            Play Again
          </button>
          
          <button
            onClick={handleBackToMenu}
            className="w-full py-3 bg-white text-purple-700 border border-purple-300 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
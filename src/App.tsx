import React, { useState } from 'react';
import Game from './components/Game';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import GameOver from './components/GameOver';
import { AudioProvider } from './contexts/AudioContext';

type GameState = 'menu' | 'levelSelect' | 'playing' | 'gameOver';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [finalScore, setFinalScore] = useState(0);

  const handleStartGame = () => {
    setGameState('levelSelect');
  };

  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level);
    setGameState('playing');
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState('gameOver');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  const handlePlayAgain = () => {
    setGameState('playing');
  };

  return (
    <AudioProvider>
      <div className="w-full h-screen bg-gradient-to-b from-cyan-200 to-teal-200 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full max-w-2xl max-h-[800px] flex flex-col items-center justify-center relative">
          {gameState === 'menu' && <MainMenu onStart={handleStartGame} />}
          
          {gameState === 'levelSelect' && (
            <LevelSelect onSelect={handleLevelSelect} onBack={handleBackToMenu} />
          )}
          
          {gameState === 'playing' && (
            <Game 
              level={selectedLevel} 
              onGameOver={handleGameOver}
              onBackToMenu={handleBackToMenu}
            />
          )}
          
          {gameState === 'gameOver' && (
            <GameOver 
              score={finalScore} 
              onPlayAgain={handlePlayAgain} 
              onBackToMenu={handleBackToMenu}
            />
          )}
        </div>
      </div>
    </AudioProvider>
  );
}

export default App;
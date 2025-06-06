import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
// import { GameEngine } from '../game/GameEngine'; // 기존 엔진 주석 처리
import { NewGameEngine, GameStatus, GameEngineCallbacks } from '../game/new_engine/NewGameEngine'; // 새 엔진 import
import { Heart, Pause, Play, Home, RotateCcw } from 'lucide-react'; // Play, RotateCcw 아이콘 추가

interface GameProps {
  level: number;
  onGameOver: (score: number) => void;
  onBackToMenu: () => void;
}

const Game: React.FC<GameProps> = ({ level, onGameOver, onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3); // 초기 생명은 엔진에서 관리하므로, 엔진 콜백으로 업데이트
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Ready);
  const gameEngineRef = useRef<NewGameEngine | null>(null);
  const { playSound, stopSound } = useAudio(); // stopSound 추가

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // GameEngine 콜백 정의
    const gameCallbacks: GameEngineCallbacks = {
      onScoreChange: (newScore) => setScore(newScore),
      onLivesChange: (newLives) => {
        // Accessing current lives via state setter's callback form to avoid stale closure
        setLives(currentActualLives => {
          if (newLives < currentActualLives) {
            playSound('lifeLost');
          }
          return newLives;
        });
      },
      onGameStatusChange: (newStatus, currentScore) => { // currentScore from engine
        setGameStatus(newStatus);
        if (newStatus === GameStatus.GameOver) {
          stopSound('bgMusic');
          onGameOver(currentScore ?? score); // Pass score from engine if available
        } else if (newStatus === GameStatus.LevelComplete) {
          stopSound('bgMusic');
          playSound('levelComplete');
          // 레벨 완료 처리 (예: 다음 레벨 선택 화면 또는 onGameOver 호출)
          // For now, let's treat level complete like game over for menu display
          onGameOver(currentScore ?? score);
        } else if (newStatus === GameStatus.Playing) {
          playSound('bgMusic', true);
        } else if (newStatus === GameStatus.Paused) {
          stopSound('bgMusic'); // 일시정지 시 배경음악 중지
        }
      },
      // onPowerUpCollected: (type) => { // PowerUp은 아직 새 엔진에 구현 안됨
      //   playSound('powerUp');
      //   if (type === 'extraLife') {
      //     // setLives((prev) => prev + 1); // lives는 엔진 콜백으로 처리
      //   }
      // }
    };

    // NewGameEngine 인스턴스 생성
    const gameEngine = new NewGameEngine(canvas, gameCallbacks);
    gameEngineRef.current = gameEngine;

    // 초기 생명, 점수, 상태 설정 (엔진에서 설정된 값을 가져옴)
    setLives(gameEngine.initialLives);
    // Score and status are set by callbacks from initializeLevel in engine

    const handleResize = () => {
      const container = canvas.parentElement;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        // canvas.width = width; // 엔진 내부 resize에서 처리
        // canvas.height = height;
        gameEngineRef.current?.resize(width, height);
      }
    };

    handleResize(); // 초기 사이즈 설정
    window.addEventListener('resize', handleResize);

    // 게임 시작 (엔진의 start는 Playing 상태로 만들고 루프 시작)
    gameEngine.start();
    gameEngine.setGameStatus(GameStatus.Playing);

    return () => {
      window.removeEventListener('resize', handleResize);
      gameEngineRef.current?.destroy(); // 엔진 정리 메소드 호출
      stopSound('bgMusic');
    };
  // level prop 변경 시 엔진 재시작 로직은 NewGameEngine 내부에서 initializeLevel 등으로 처리하거나,
  // Game.tsx에서 engine.destroy() 후 새 엔진 생성으로 처리할 수 있음.
  // 현재 NewGameEngine은 level 개념이 생성자에 없으므로, level prop 변경 시에는
  // 엔진을 재 생성하거나, 엔진에 loadLevel(level) 메소드를 만들어 호출해야함.
  // 여기서는 단순화를 위해 level 변경 시 재 마운트되어 새 엔진이 생성된다고 가정.
  }, [level, onGameOver, playSound, stopSound]); // onBackToMenu 제거, score 제거

  const handleTogglePause = () => {
    const engine = gameEngineRef.current;
    if (!engine) return;

    if (engine.status === GameStatus.Playing) {
      engine.pause();
    } else if (engine.status === GameStatus.Paused) {
      engine.resume();
    }
  };

  const handleBackClick = () => {
    // gameEngineRef.current?.destroy(); // destroy is called in useEffect cleanup
    onBackToMenu();
  };

  const handleRestartGame = () => { // Renamed
    if (gameEngineRef.current?.status === GameStatus.GameOver ||
        gameEngineRef.current?.status === GameStatus.LevelComplete) {
      gameEngineRef.current?.start();
      // Ensure engine's start() handles setting to Playing or Game.tsx will after this.
      // If engine.start() sets to Ready, the next setGameStatus in useEffect might be too soon or out of sync.
      // For now, assume engine.start() will bring it to Ready, and then it needs to be set to Playing.
      // Let's add it here for robustness for "Play Again"
      gameEngineRef.current?.setGameStatus(GameStatus.Playing);
    }
  };

  const isGameScreen = gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused;

  return (
    <div className="w-full h-full flex flex-col relative bg-gradient-to-b from-blue-100 to-purple-100">
      {isGameScreen ? (
        <>
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
                onClick={handleTogglePause}
                className="w-10 h-10 flex items-center justify-center bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
              >
                {gameStatus === GameStatus.Paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
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
              className="absolute inset-0" // 배경색은 div로 옮김
            />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white/70 backdrop-blur-md">
          {(gameStatus === GameStatus.GameOver || gameStatus === GameStatus.LevelComplete) && (
            <>
              <h2 className="text-4xl font-bold text-red-600">
                {gameStatus === GameStatus.GameOver ? 'Game Over' : 'Level Complete!'}
              </h2>
              <p className="text-2xl text-purple-700">Your Score: {score}</p>
              <div className="flex gap-4">
                <button
                  onClick={handleRestartGame} // Changed here
                  className="px-6 py-3 bg-blue-500 text-white rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  <RotateCcw className="inline mr-2"/> Play Again
                </button>
                <button
                  onClick={handleBackClick}
                  className="px-6 py-3 bg-pink-500 text-white rounded-full text-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                  <Home className="inline mr-2"/> Main Menu
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Game;
import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { ArrowLeft } from 'lucide-react';

interface LevelSelectProps {
  onSelect: (level: number) => void;
  onBack: () => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({ onSelect, onBack }) => {
  const { playSound } = useAudio();
  const levels = [
    { id: 1, name: "Candy Land", difficulty: "Easy" },
    { id: 2, name: "Cloud Kingdom", difficulty: "Easy" },
    { id: 3, name: "Magic Forest", difficulty: "Medium" },
    { id: 4, name: "Dream Castle", difficulty: "Medium" },
    { id: 5, name: "Star Galaxy", difficulty: "Hard" },
    { id: 6, name: "Rainbow World", difficulty: "Hard" },
  ];

  const handleLevelSelect = (level: number) => {
    playSound('buttonClick');
    onSelect(level);
  };

  const handleBack = () => {
    playSound('buttonClick');
    onBack();
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full bg-white/70 hover:bg-white text-purple-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-purple-800 ml-4">Select Level</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-4">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => handleLevelSelect(level.id)}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 hover:bg-white transition-all transform hover:scale-105 shadow-md flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 mb-2 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {level.id}
            </div>
            <h3 className="text-lg font-bold text-purple-800">{level.name}</h3>
            <span className={`text-sm font-medium ${
              level.difficulty === 'Easy' ? 'text-green-600' :
              level.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {level.difficulty}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelect;
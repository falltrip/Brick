import React, { createContext, useContext, useEffect, useState } from 'react';

type SoundType = 
  | 'buttonClick' 
  | 'blockHit' 
  | 'powerUp' 
  | 'lifeLost' 
  | 'gameOver' 
  | 'levelComplete';

interface AudioContextType {
  playSound: (type: SoundType, loop?: boolean) => void;
  stopSound: (type: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const SOUND_URLS: Record<SoundType, string> = {
  buttonClick: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  blockHit: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
  powerUp: 'https://assets.mixkit.co/active_storage/sfx/1343/1343-preview.mp3',
  lifeLost: 'https://assets.mixkit.co/active_storage/sfx/566/566-preview.mp3',
  gameOver: 'https://assets.mixkit.co/active_storage/sfx/262/262-preview.mp3',
  levelComplete: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sounds, setSounds] = useState<Record<SoundType, HTMLAudioElement | null>>({
    buttonClick: null,
    blockHit: null,
    powerUp: null,
    lifeLost: null,
    gameOver: null,
    levelComplete: null
  });
  
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const savedMute = localStorage.getItem('kawaiiBreaker_muted');
    return savedMute ? JSON.parse(savedMute) : false;
  });

  useEffect(() => {
    const newSounds: Record<SoundType, HTMLAudioElement> = {} as Record<SoundType, HTMLAudioElement>;
    
    (Object.keys(SOUND_URLS) as SoundType[]).forEach(type => {
      const audio = new Audio(SOUND_URLS[type]);
      
      if (type === 'blockHit') {
        audio.volume = 0.3;
      } else {
        audio.volume = 0.6;
      }
      
      audio.muted = isMuted;
      newSounds[type] = audio;
    });
    
    setSounds(newSounds);
    
    return () => {
      Object.values(newSounds).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  useEffect(() => {
    Object.values(sounds).forEach(audio => {
      if (audio) {
        audio.muted = isMuted;
      }
    });
    
    localStorage.setItem('kawaiiBreaker_muted', JSON.stringify(isMuted));
  }, [isMuted, sounds]);

  const playSound = (type: SoundType, loop: boolean = false) => {
    const sound = sounds[type];
    if (sound) {
      sound.currentTime = 0;
      sound.loop = loop;
      sound.play().catch(err => console.error("Error playing sound:", err));
    }
  };

  const stopSound = (type: SoundType) => {
    const sound = sounds[type];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <AudioContext.Provider value={{ playSound, stopSound, isMuted, toggleMute }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
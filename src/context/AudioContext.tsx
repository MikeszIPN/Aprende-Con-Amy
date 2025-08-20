// src/context/AudioContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SfxName = 'correct' | 'incorrect' | 'next' | 'badge' | 'complete';

type AudioContextType = {
  /* efectos de sonido */
  sfx: (name: SfxName) => void;

  /* música de fondo */
  toggleMusic: () => void;   // ON/OFF preferencia del usuario
  pauseMusic: () => void;    // pausa temporal (p. ej. durante un vídeo)
  resumeMusic: () => void;   // reanuda si estaba sonando antes de pausar
  musicOn: boolean;          // preferencia actual
};

const AudioContext = createContext<AudioContextType>({
  sfx: () => {},
  toggleMusic: () => {},
  pauseMusic: () => {},
  resumeMusic: () => {},
  musicOn: true,
});

export const useAudio = () => useContext(AudioContext);

const KEY = 'amy@music';

export const AudioProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [musicSound, setMusicSound] = useState<Audio.Sound | null>(null);
  const [musicOn, setMusicOn]       = useState(true);      // preferencia guardada
  const [internallyPaused, setInternallyPaused] = useState(false); // pausa temporal

  /* -------- carga de preferencia guardada -------- */
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      if (saved !== null) setMusicOn(saved === 'true');
    })();
  }, []);

  /* -------- reproduce / detiene según preferencia -------- */
  useEffect(() => {
    (async () => {
      if (musicOn) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/audio/bgm.mp3'),
          { isLooping: true, volume: 0.4 },
        );
        setMusicSound(sound);
        await sound.playAsync();
      } else {
        musicSound && (await musicSound.unloadAsync());
        setMusicSound(null);
      }
    })();

    return () => { musicSound && musicSound.unloadAsync(); };
  }, [musicOn]);

  /* -------- helpers públicos -------- */
  const toggleMusic = () => {
    AsyncStorage.setItem(KEY, (!musicOn).toString());
    setMusicOn(!musicOn);
  };

  const pauseMusic = async () => {
    if (musicSound && musicOn && !internallyPaused) {
      const status = (await musicSound.getStatusAsync()) as AVPlaybackStatus;
      if (status.isLoaded && status.isPlaying) {
        await musicSound.pauseAsync();
        setInternallyPaused(true);
      }
    }
  };

  const resumeMusic = async () => {
    if (musicSound && internallyPaused) {
      const status = (await musicSound.getStatusAsync()) as AVPlaybackStatus;
      if (status.isLoaded && !status.isPlaying) {
        await musicSound.playAsync();
        setInternallyPaused(false);
      }
    }
  };

  /* -------- efectos de sonido -------- */
  const sfx = async (name: SfxName) => {
    const map = {
      correct: require('../../assets/audio/correct.mp3'),
      incorrect: require('../../assets/audio/incorrect.mp3'),
      next: require('../../assets/audio/next.mp3'),
      badge: require('../../assets/audio/badge.mp3'),
      complete: require('../../assets/audio/complete.mp3'),
    };
    const { sound } = await Audio.Sound.createAsync(map[name], { volume: 0.8 });
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync(), 1500);
  };

  return (
    <AudioContext.Provider
      value={{ sfx, toggleMusic, pauseMusic, resumeMusic, musicOn }}>
      {children}
    </AudioContext.Provider>
  );
};

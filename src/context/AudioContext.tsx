// src/context/AudioContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createAudioPlayer } from 'expo-audio';
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
  const [bgmPlayer, setBgmPlayer] = useState<ReturnType<typeof createAudioPlayer> | null>(null);
  const [musicOn, setMusicOn] = useState(true);      // preferencia guardada
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
      try {
        // Crear el reproductor de música de fondo si no existe
        if (!bgmPlayer) {
          const player = createAudioPlayer(require('../../assets/audio/bgm.mp3'));
          player.loop = true;
          player.volume = 0.4;
          setBgmPlayer(player);
          if (musicOn) {
            player.play();
          }
        } else {
          // Controlar reproducción/pausa basado en musicOn
          if (musicOn && !bgmPlayer.playing) {
            bgmPlayer.play();
          } else if (!musicOn && bgmPlayer.playing) {
            bgmPlayer.pause();
          }
        }
      } catch (error) {
        console.error('Error playing music:', error);
      }
    })();

    return () => {
      if (bgmPlayer && bgmPlayer.playing) {
        bgmPlayer.pause();
      }
    };
  }, [bgmPlayer, musicOn]);

  /* -------- helpers públicos -------- */
  const toggleMusic = () => {
    AsyncStorage.setItem(KEY, (!musicOn).toString());
    setMusicOn(!musicOn);
  };

  const pauseMusic = async () => {
    if (bgmPlayer && musicOn && !internallyPaused && bgmPlayer.playing) {
      try {
        bgmPlayer.pause();
        setInternallyPaused(true);
      } catch (error) {
        console.error('Error pausing music:', error);
      }
    }
  };

  const resumeMusic = async () => {
    if (bgmPlayer && internallyPaused && !bgmPlayer.playing) {
      try {
        bgmPlayer.play();
        setInternallyPaused(false);
      } catch (error) {
        console.error('Error resuming music:', error);
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
    try {
      const soundPlayer = createAudioPlayer(map[name]);
      soundPlayer.volume = 0.8;
      soundPlayer.play();
      setTimeout(() => soundPlayer.release(), 1500);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  return (
    <AudioContext.Provider
      value={{ sfx, toggleMusic, pauseMusic, resumeMusic, musicOn }}>
      {children}
    </AudioContext.Provider>
  );
};

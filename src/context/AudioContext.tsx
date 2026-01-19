// src/context/AudioContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createAudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

const narrationMap: Record<string, any> = {
  rotacion_de_cultivos: require('../../assets/audio/rotacion_de_cultivos.mp3'),
  compostaje: require('../../assets/audio/compostaje.mp3'),
  uso_eficiente_deagua: require('../../assets/audio/uso_eficiente_deagua.mp3'),
  biodiversidad: require('../../assets/audio/biodiversidad.mp3'),
  solo_un_oquito_es_dulce: require('../../assets/audio/solo_un_oquito_es_dulce.mp3'),
  habitos_en_casas: require('../../assets/audio/habitos_en_casa.mp3'),
  no_la_ensuciemos: require('../../assets/audio/no_la_ensuciemos.mp3'),
  reutiliza_y_recoge_lluvia: require('../../assets/audio/reutiliza_y_recoge_lluvia.mp3'),
  aire_limpio: require('../../assets/audio/aire_limpio.mp3'),
  fuente_de_contaminacion: require('../../assets/audio/fuente_de_contaminacion.mp3'),
  lo_que_puedes_hacer: require('../../assets/audio/lo_que_puedes_hacer.mp3'),
  planta_un_arbol: require('../../assets/audio/planta_un_arbol.mp3'),
  basura_por_todos_lados: require('../../assets/audio/basura_por_todos_lados.mp3'),
  las_3_r: require('../../assets/audio/las_3_r.mp3'),
  separacion_en_cas: require('../../assets/audio/separacion_en_cas.mp3'),
  no_plastico: require('../../assets/audio/no_plastico.mp3'),
};



type SfxName = 'correct' | 'incorrect' | 'next' | 'badge' | 'complete';

type AudioContextType = {
  /* Efectos de sonido */
  sfx: (name: SfxName) => void;

  /* Narración automática */
  playNarration: (key: string) => Promise<void>;
  stopNarration: () => Promise<void>;

  /* Música de fondo */
  toggleMusic: () => void;
  pauseMusic: () => void;
  resumeMusic: () => void;
  musicOn: boolean;
};

const AudioContext = createContext<AudioContextType>({
  sfx: () => {},
  playNarration: async () => {},
  stopNarration: async () => {},
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
  const [narrationPlayer, setNarrationPlayer] = useState<ReturnType<typeof createAudioPlayer> | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      if (saved !== null) setMusicOn(saved === 'true');
    })();
  }, []);

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

  /* -------- Efectos de sonido (SFX) -------- */
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

  /* -------- Lógica de Narración -------- */
  const playNarration = async (key: string) => {
    if (narrationMap[key]) {
      try {
        // Stop the previous narration player if it exists
        if (narrationPlayer) {
          try {
            narrationPlayer.pause();
          } catch (e) {
            // ignore pause errors, player might be already released
          }
          try {
            narrationPlayer.release();
          } catch (e) {
            // ignore release errors
          }
        }
        
        const player = createAudioPlayer(narrationMap[key]);
        player.volume = 1.0;
        player.play();
        setNarrationPlayer(player);
      } catch (error) {
        console.error("Error cargando audio de narración:", error);
      }
    }
  };

  const stopNarration = async () => {
    if (narrationPlayer) {
      try {
        try {
          narrationPlayer.pause();
        } catch (e) {
          // ignore pause errors
        }
        try {
          narrationPlayer.release();
        } catch (e) {
          // ignore release errors
        }
      } catch (error) {
        // ignore any errors during cleanup
      }
      setNarrationPlayer(null);
    }
  };

  return (
    <AudioContext.Provider
      value={{ sfx, playNarration, stopNarration, toggleMusic, pauseMusic, resumeMusic, musicOn }}>
      {children}
    </AudioContext.Provider>
  );
};
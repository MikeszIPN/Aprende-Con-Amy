// src/context/AudioContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
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
  const [musicSound, setMusicSound] = useState<Audio.Sound | null>(null);
  const [narrationSound, setNarrationSound] = useState<Audio.Sound | null>(null);
  const [musicOn, setMusicOn] = useState(true);
  const [internallyPaused, setInternallyPaused] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      if (saved !== null) setMusicOn(saved === 'true');
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (musicOn) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/audio/bgm.mp3'),
          { isLooping: true, volume: 0.15 }, // Volumen bajo para priorizar la voz
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

  /* -------- Efectos de sonido (SFX) -------- */
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
    setTimeout(() => sound.unloadAsync(), 1500); // Descarga automática
  };

  /* -------- Lógica de Narración -------- */
  const playNarration = async (key: string) => {
    // 1. Detener y limpiar cualquier narración anterior
    if (narrationSound) {
      await narrationSound.stopAsync();
      await narrationSound.unloadAsync();
      setNarrationSound(null);
    }

    // 2. Verificar si el audio existe en nuestro mapa y reproducir
    if (narrationMap[key]) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          narrationMap[key],
          { volume: 1.0 }
        );
        setNarrationSound(sound);
        await sound.playAsync();
      } catch (error) {
        console.error("Error cargando audio de narración:", error);
      }
    }
  };

  const stopNarration = async () => {
    if (narrationSound) {
      await narrationSound.stopAsync();
      await narrationSound.unloadAsync();
      setNarrationSound(null);
    }
  };

  return (
    <AudioContext.Provider
      value={{ sfx, playNarration, stopNarration, toggleMusic, pauseMusic, resumeMusic, musicOn }}>
      {children}
    </AudioContext.Provider>
  );
};
// src/context/ProgressContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Progress = {
  badges: boolean[];      // 4 lecciones → true/false
};

type ProgressContextType = {
  progress: Progress;
  gainBadge: (lessonId: number) => void;
  reset: () => void;
};

const defaultState: Progress = { badges: [false, false, false, false] };

const ProgressContext = createContext<ProgressContextType>({
  progress: defaultState,
  gainBadge: () => {},
  reset: () => {},
});

export const useProgress = () => useContext(ProgressContext);

const KEY = 'amy@progress';

export const ProgressProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [progress, setProgress] = useState<Progress>(defaultState);

  // Cargar progreso guardado
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      saved && setProgress(JSON.parse(saved));
    })();
  }, []);

  // Persistir al cambiar
  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(progress));
  }, [progress]);

  const gainBadge = (lessonId: number) =>
    setProgress((p) => {
      const badges = [...p.badges];
      badges[lessonId] = true;
      return { badges };
    });

  const reset = () => {
    setProgress(defaultState);
    AsyncStorage.removeItem(KEY);
  };

  return (
    <ProgressContext.Provider value={{ progress, gainBadge, reset }}>
      {children}
    </ProgressContext.Provider>
  );
};

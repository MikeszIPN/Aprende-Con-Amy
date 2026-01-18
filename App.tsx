import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';

import { AudioProvider } from './src/context/AudioContext';
import { ProgressProvider } from './src/context/ProgressContext';
import AppNavigator from './src/navigation/AppNavigator';

// Mantiene la pantalla de carga visible
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Cargamos las fuentes de Google Fonts
        await Font.loadAsync({
          'NunitoRegular': Nunito_400Regular,
          'NunitoBold': Nunito_700Bold,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Oculta la pantalla de carga una vez que las fuentes están listas
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AudioProvider>
        <ProgressProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ProgressProvider>
      </AudioProvider>
    </View>
  );
}
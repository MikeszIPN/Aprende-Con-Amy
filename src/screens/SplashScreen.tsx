/**
 * Pantalla visible mientras se cargan todas las fuentes y assets.
 * Ten en cuenta que `expo-splash-screen` ya cubre gran parte del trabajo,
 * pero si quisieras un componente separado dentro de la navegación, aquí lo tienes.
 */

import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* Amy centrada */}
      <Image
        source={require('../../assets/images/amy/amy_idle.png')}
        style={styles.amy}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#4CAF50" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  amy: { width: 220, height: 220, marginBottom: 20 },
});

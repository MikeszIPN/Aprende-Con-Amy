// src/screens/CreditsScreen.tsx
import React, { useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAudio } from '../context/AudioContext';

const PURPLE = '#B57BFF';

type Props = NativeStackScreenProps<RootStackParamList, 'Credits'>;

export default function CreditsScreen({ navigation, route }: Props) {
  const { sfx } = useAudio();

  /* ¿viene de la pantalla Congratulations? */
  const autoHome = route?.params?.autoHome ?? false;

  useEffect(() => {
    sfx('complete');

    if (autoHome) {
      /* 6 s para leer créditos → Home */
      const t = setTimeout(() => navigation.replace('Home'), 6000);
      return () => clearTimeout(t);
    }
  }, [autoHome]);

  /* ---- lista de desarrolladores ---- */
  const devNames = [
    'Miguel Ángel Sánchez Zanjuampa',
    'Valeria Pimentel Sosa',
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Créditos</Text>

        {/* Logos apilados */}
        <View style={styles.stack}>
          <Image source={require('../../assets/images/logos/logo_right.png')}    style={styles.logo} resizeMode="contain" />
          <Image source={require('../../assets/images/logos/logo_top.png')}  style={styles.logo} resizeMode="contain" />
        </View>

        {/* Información SEPE */}
        <Text style={styles.text}>
          Secretaría de Educación Pública del Estado (SEPE){'\n'}
          Unidad de Servicios Educativos del Estado de Tlaxcala (USET).
        </Text>
          

        {/* Logo IPN */}
        <View style={styles.stack}>
          <Image source={require('../../assets/images/logos/logo_left.png')}   style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.text}>
          Desarrollado por:
        </Text>

        {/* Nombres con viñetas */}
        <View style={styles.bulletBox}>
          {devNames.map((n, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{n}</Text>
            </View>
          ))}
        </View>

        {/* Información restante en párrafo */}
        <Text style={styles.text}>
          Tecnologías: React Native 0.74, Expo SDK 52.{'\n'}
          Versión 1.0 (2025).
        </Text>

        {/* Botón volver */}
        <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('Home')}>
          <Text style={styles.btnText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- estilos ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 24 },
  title: { fontFamily: 'NunitoBold', fontSize: 28, marginBottom: 20 },

  stack: { alignItems: 'center', width: '100%' },
  logo:  { width: '80%', height: 100, marginVertical: 12 },

  bulletBox: { width: '100%', marginTop: 12, marginBottom: 20 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  bullet:    { fontSize: 18, color: '#444', marginRight: 8, lineHeight: 22 },
  bulletText:{ flex: 1, fontFamily: 'NunitoRegular', fontSize: 16, color: '#444', lineHeight: 22 },

  text: {
    fontFamily: 'NunitoRegular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },

  btn: {
    backgroundColor: PURPLE,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 30,
    marginBottom: 20,
  },
  btnText: { color: '#fff', fontFamily: 'NunitoBold', fontSize: 18 },
});

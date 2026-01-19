// src/screens/HomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAudio } from '../context/AudioContext';
import { useProgress } from '../context/ProgressContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const PURPLE = '#B57BFF';
const LIGHT_PURPLE = '#E8D8FF';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { sfx, toggleMusic, musicOn } = useAudio();
  const { progress, reset } = useProgress();
  const startLesson = () => {
    sfx('next');
    navigation.navigate('CourseSelect');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ---------- Botones fijos dentro del safe-area ---------- */}
      <TouchableOpacity
        style={[styles.infoBtn, { top: insets.top + 8 }]}   // ↓ 8 px debajo del margen seguro
        onPress={() => navigation.navigate('Credits', {})}>
        <Text style={styles.infoText}>¡</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.toggle, { top: insets.top + 8 }]}    // idem para el toggle de sonido
        onPress={toggleMusic}>
        <Text style={styles.toggleText}>{musicOn ? '🔊' : '🔇'}</Text>
      </TouchableOpacity>

      {/* ---------- Main block centered ---------- */}
      <View style={styles.centerBlock}>
        <Image
          source={require('../../assets/images/logos/logo_right.png')}
          style={styles.topLogo}
          resizeMode="contain"
        />

        <View style={styles.circle}>
          <Image
            source={require('../../assets/images/amy/amy_idle.png')}
            style={styles.amy}
            resizeMode="contain"
          />
        </View>

        <Image
          source={require('../../assets/images/logos/logo_top.png')}
          style={styles.bottomLogo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Aprende con Amy</Text>

        <TouchableOpacity style={styles.btn} onPress={startLesson}>
          <Text style={styles.btnText}>Empezar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Badges')}>
          <Text style={styles.btnText}>Mis Insignias</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  /* ----- Botones fijos arriba ----- */
  infoBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    backgroundColor: PURPLE,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  infoText: { color: '#fff', fontFamily: 'NunitoBold', fontSize: 22 },
  toggle: { position: 'absolute', top: 14, left: 16, zIndex: 10 },
  toggleText: { fontSize: 26 },

  /* ----- Bloque centrado ----- */
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',        // ← centra verticalmente
    paddingHorizontal: 20,
  },

  /* ----- Logos y círculo ----- */
  topLogo:    { width: width * 0.7, height: 70, marginBottom: 10 },
  circle: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: width * 0.325,
    backgroundColor: LIGHT_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amy: { width: '78%', height: '78%' },
  bottomLogo: { width: width * 0.6, height: 60, marginTop: 14, marginBottom: 18 },

  /* ----- Texto y botones ----- */
  title: {
    fontFamily: 'NunitoBold',
    fontSize: 32,
    color: PURPLE,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: PURPLE,
    width: width * 0.62,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 6,
  },
  btnText: { color: '#fff', fontFamily: 'NunitoBold', fontSize: 18 },
});

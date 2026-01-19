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

const { width } = Dimensions.get('window');


const PURPLE = '#A362FF'; 
const DARK_PURPLE = '#8549DB'; 
const LIGHT_PURPLE = '#E8D8FF';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { sfx, toggleMusic, musicOn } = useAudio();
  
  const startLesson = () => {
    sfx('next');
    navigation.navigate('CourseSelect');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Botones de utilidad superiores */}
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

      <TouchableOpacity
        style={[styles.infoBtn, { top: insets.top + 10 }]}
        onPress={() => navigation.navigate({ name: 'Credits', params: { autoHome: false } })}>
        <Text style={styles.infoText}>¡</Text>
      </TouchableOpacity>

      <View style={styles.centerBlock}>
        {/* Logo Superior */}
        <Image
          source={require('../../assets/images/logos/logo_right.png')}
          style={styles.topLogo}
          resizeMode="contain"
        />

        {/* Personaje en Círculo */}
        <View style={styles.circle}>
          <Image
            source={require('../../assets/images/amy/amy_idle.png')}
            style={styles.amy}
            resizeMode="contain"
          />
        </View>

        {/* Logo debajo del círculo */}
        <Image
          source={require('../../assets/images/logos/logo_top.png')}
          style={styles.bottomLogo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Aprende con Amy</Text>

        {/* --- BOTONES --- */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.btn} 
          onPress={startLesson}
        >
          <Text style={styles.btnText}>¡EMPEZAR QUIZ!</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[styles.btn, { backgroundColor: '#9049FF', borderBottomColor: '#7236D1' }]} 
          onPress={() => navigation.navigate('Badges')}
        >
          <Text style={styles.btnText}>MIS INSIGNIAS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  infoBtn: {
    position: 'absolute',
    right: 16,
    backgroundColor: PURPLE,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderBottomWidth: 3,
    borderBottomColor: DARK_PURPLE,
  },
  infoText: { 
    color: '#fff', 
    fontFamily: 'NunitoBold', 
    fontSize: 24,
    fontWeight: '900' 
  },
  toggle: { 
    position: 'absolute', 
    left: 16, 
    zIndex: 10 
  },
  toggleText: { 
    fontSize: 28 
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topLogo: { 
    width: width * 0.6, 
    height: 60, 
    marginBottom: 10 
  },
  circle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    backgroundColor: LIGHT_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amy: { 
    width: '80%', 
    height: '80%' 
  },
  bottomLogo: { 
    width: width * 0.5, 
    height: 50, 
    marginTop: 10, 
    marginBottom: 10 
  },
  title: {
    fontFamily: 'NunitoBold',
    fontSize: 28,
    color: PURPLE,
    marginBottom: 25,
    fontWeight: 'bold',
  },

  btn: {
    backgroundColor: PURPLE,
    width: width * 0.85,
    paddingVertical: 18,
    borderRadius: 12, 
    alignItems: 'center',
    marginVertical: 8,
    borderBottomWidth: 6,
    borderBottomColor: DARK_PURPLE,
  },
  btnText: { 
    color: '#fff', 
    fontFamily: 'NunitoBold', 
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5, 
  },
});
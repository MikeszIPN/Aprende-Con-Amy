import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProgress } from '../context/ProgressContext';
import { useAudio } from '../context/AudioContext';
import lessons from '../data/lessons.json';

const { width } = Dimensions.get('window');


const PURPLE = '#A362FF'; 
const DARK_PURPLE = '#8549DB';
const RED = '#FF5C5C';
const DARK_RED = '#D14242';
const BG_CARD = '#F8F4FF';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseSelect'>;

const unlocked = {
  agriculture: require('../../assets/images/badges/badge_agriculture.png'),
  water:       require('../../assets/images/badges/badge_water.png'),
  air:         require('../../assets/images/badges/badge_air.png'),
  pollution:   require('../../assets/images/badges/badge_pollution.png'),
};
const locked = {
  agriculture: require('../../assets/images/badges_locked/agriculture_badge_locked.png'),
  water:       require('../../assets/images/badges_locked/water_badge_locked.png'),
  air:         require('../../assets/images/badges_locked/air_badge_locked.png'),
  pollution:   require('../../assets/images/badges_locked/pollution_badge_locked.png'),
};

export default function CourseSelectScreen({ navigation }: Props) {
  const { progress, reset } = useProgress();
  const { sfx } = useAudio();
  const insets = useSafeAreaInsets();

  const allDone   = progress.badges.every(Boolean);
  const completed = progress.badges.filter(Boolean).length;
  const percent   = Math.round((completed / lessons.length) * 100);

  const handleSelect = (lessonId: number) => {
    if (progress.badges[lessonId]) {
      Alert.alert('Curso completado', '¡Ya dominaste este curso! Elige otro.');
      return;
    }
    sfx('next');
    navigation.navigate('InfoCarousel', { lessonId });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.heading}>Selecciona el curso</Text>

        {/* ---------- Rejilla de Cursos ---------- */}
        <View style={styles.grid}>
          {lessons.map((lesson, i) => {
            const key = lesson.key as keyof typeof unlocked;
            const isCompleted = progress.badges[i];
            const img = isCompleted ? unlocked[key] : locked[key];
            
            return (
              <TouchableOpacity
                key={key}
                style={[styles.card, isCompleted && styles.cardCompleted]}
                onPress={() => handleSelect(i)}
                activeOpacity={0.9}>
                <View style={styles.badgeContainer}>
                  <Image source={img} style={styles.badge} resizeMode="contain" />
                </View>
                <Text style={styles.cardLabel}>{lesson.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------- Barra de Progreso Visual ---------- */}
        <View style={styles.progressContainer}>
           <Text style={styles.progressMsg}>
            {percent === 100 ? '¡Dominas todos los temas!' : `Progreso: ${percent}%`}
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
          </View>
        </View>

        {/* ---------- Botones Inferiores ---------- */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.homeBtn}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }}>
            <Text style={styles.btnTxt}>Volver al Inicio</Text>
          </TouchableOpacity>

          {allDone && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.resetBtn}
              onPress={() =>
                Alert.alert(
                  'Reiniciar progreso',
                  '¿Seguro que deseas reiniciar tu progreso?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Reiniciar', style: 'destructive', onPress: reset },
                  ],
                )
              }>
              <Text style={styles.btnTxt}>REINICIAR PROGRESO</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD_W = (width - 60) / 2;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  heading: { 
    fontFamily: 'NunitoBold', 
    fontSize: 28, 
    color: PURPLE,
    marginBottom: 20,
    fontWeight: '800'
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center',
    width: '100%' 
  },

  card: { 
    width: CARD_W, 
    backgroundColor: BG_CARD,
    borderRadius: 15,
    padding: 12,
    margin: 10,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#D1C4E9',
  },
  cardCompleted: {
    backgroundColor: '#F0FFF0',
    borderBottomColor: '#C2E0C2',
  },
  badgeContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: { 
    width: '90%', 
    height: '90%',
  },
  cardLabel: { 
    fontFamily: 'NunitoBold', 
    textAlign: 'center', 
    fontSize: 14, 
    color: '#444',
    fontWeight: '700'
  },

  progressContainer: {
    width: '80%',
    marginTop: 30,
    alignItems: 'center',
  },
  progressMsg: { 
    fontFamily: 'NunitoBold', 
    fontSize: 18, 
    marginBottom: 8,
    color: '#666'
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: '#EEE',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50', // Verde de progreso
    borderRadius: 6,
  },

  footer: { 
    width: '100%', 
    alignItems: 'center', 
    position: 'absolute', 
    bottom: 0 
  },
  homeBtn: { 
    backgroundColor: PURPLE, 
    width: '85%', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: DARK_PURPLE,
  },
  resetBtn: { 
    backgroundColor: RED, 
    width: '85%', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 15,
    borderBottomWidth: 5,
    borderBottomColor: DARK_RED,
  },
  btnTxt: { 
    color: '#fff', 
    fontFamily: 'NunitoBold', 
    fontSize: 18, 
    fontWeight: '800',
    letterSpacing: 1
  },
});
// src/screens/CourseSelectScreen.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProgress } from '../context/ProgressContext';
import { useAudio } from '../context/AudioContext';
import lessons from '../data/lessons.json';

const { width } = Dimensions.get('window');
const PURPLE = '#B57BFF';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseSelect'>;

/* --- Mapas de insignias --- */
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

        {/* ---------- rejilla 2×2 ---------- */}
        <View style={styles.grid}>
          {lessons.map((lesson, i) => {
            const key       = lesson.key as keyof typeof unlocked;
            const completed = progress.badges[i];
            const img       = completed ? unlocked[key] : locked[key];
            return (
              <TouchableOpacity
                key={key}
                style={styles.card}
                onPress={() => handleSelect(i)}
                activeOpacity={0.8}>
                <Image source={img} style={styles.badge} resizeMode="contain" />
                <Text style={styles.cardLabel}>{lesson.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------- mensaje progreso ---------- */}
        <Text style={styles.progressMsg}>
          {percent === 100
            ? '¡Felicidades, curso completado!'
            : `Llevas ${percent}% del curso.`}
        </Text>

        {/* ---------- zona inferior ---------- */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          {/* botón HOME (siempre) */}
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.replace('Home')}>
            <Text style={styles.btnTxt}>Volver al Inicio</Text>
          </TouchableOpacity>

          {/* botón RESET (solo si todo completado) */}
          {allDone && (
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() =>
                Alert.alert(
                  'Reiniciar progreso',
                  '¿Seguro que deseas reiniciar tu progreso?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Reiniciar',
                      style: 'destructive',
                      onPress: reset,
                    },
                  ],
                )
              }>
              <Text style={styles.btnTxt}>Reiniciar progreso</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- estilos ---------------- */
const CARD_W = (width - 60) / 2;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 24, // added padding so content doesn't overlap notifications
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // centers content vertically
  },
  gridWrap: { flex: 1, justifyContent: 'center', width: '100%' },
  heading:{ fontFamily:'NunitoBold', fontSize:28, marginBottom:14 },
  grid:{ flexDirection:'row', flexWrap:'wrap', justifyContent:'center' },
  card:{ width:CARD_W, alignItems:'center', margin:10 },
  badge:{ width:CARD_W, height:CARD_W, borderRadius:16 },
  cardLabel:{ marginTop:6, fontFamily:'NunitoBold', textAlign:'center' },
  progressMsg:{ marginVertical:16, fontFamily:'NunitoRegular', fontSize:16 },
  footer:{ width: '100%', alignItems: 'center', position: 'absolute', bottom: 0, paddingBottom: 12 },
  homeBtn:{ backgroundColor:PURPLE, padding:12, borderRadius:14, width:'70%', alignItems:'center' },
  resetBtn:{ backgroundColor:'#F44336', padding:12, borderRadius:14, width:'70%', alignItems:'center', marginTop:10 },
  btnTxt:{ color:'#fff', fontFamily:'NunitoBold', fontSize:16 },
});

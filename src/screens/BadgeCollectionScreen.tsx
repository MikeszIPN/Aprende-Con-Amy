// src/screens/BadgeCollectionScreen.tsx
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProgress } from '../context/ProgressContext';
import { useAudio } from '../context/AudioContext';
import lessons from '../data/lessons.json';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#B57BFF';
const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Badges'>;

/* -------- Mapas estáticos (require literal) -------- */
const unlocked: Record<string, any> = {
  agriculture: require('../../assets/images/badges/badge_agriculture.png'),
  water:       require('../../assets/images/badges/badge_water.png'),
  air:         require('../../assets/images/badges/badge_air.png'),
  pollution:   require('../../assets/images/badges/badge_pollution.png'),
};

const locked: Record<string, any> = {
  agriculture: require('../../assets/images/badges_locked/agriculture_badge_locked.png'),
  water:       require('../../assets/images/badges_locked/water_badge_locked.png'),
  air:         require('../../assets/images/badges_locked/air_badge_locked.png'),
  pollution:   require('../../assets/images/badges_locked/pollution_badge_locked.png'),
};

export default function BadgeCollectionScreen({ navigation }: Props) {
  const { progress } = useProgress();
  const { sfx } = useAudio();

  const completed = progress.badges.filter(Boolean).length;
  const percent   = Math.round((completed / lessons.length) * 100);

  const goHome = () => {
    sfx('next');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mis Insignias</Text>

        {lessons.map((lesson, i) => {
          const key = lesson.key as keyof typeof unlocked;
          const img = progress.badges[i] ? unlocked[key] : locked[key];

          return (
            <View key={key} style={styles.card}>
              <Image source={img} style={styles.badge} resizeMode="contain" />
              <Text style={styles.badgeTitle}>{lesson.title}</Text>
            </View>
          );
        })}

        <Text style={styles.progressMsg}>
          {percent === 100
            ? '¡Felicidades, has completado el curso!'
            : `Tienes ${percent}% del curso completado, ¡completa los demás cursos!`}
        </Text>

        <TouchableOpacity style={styles.btn} onPress={goHome}>
          <Text style={styles.btnText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const BADGE_W = width * 0.45;  // ancho aprox. para la columna

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#fff' },
  container: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  title:     { fontFamily: 'NunitoBold', fontSize: 28, marginBottom: 20, color: PURPLE },
  card:      { alignItems: 'center', marginVertical: 16 },
  badge:     { width: BADGE_W, height: BADGE_W },
  badgeTitle:{ marginTop: 8, fontFamily: 'NunitoBold', fontSize: 18, textAlign: 'center', color: '#444' },
  progressMsg:{ marginVertical: 24, fontFamily: 'NunitoRegular', fontSize: 16, textAlign: 'center', color: '#555' },
  btn:       { backgroundColor: PURPLE, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 14, marginBottom: 30 },
  btnText:   { color: '#fff', fontFamily: 'NunitoBold', fontSize: 18 },
});

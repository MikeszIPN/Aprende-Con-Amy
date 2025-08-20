// src/screens/ResultsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import lessons from '../data/lessons.json';
import { useProgress } from '../context/ProgressContext';
import { useAudio } from '../context/AudioContext';
import ConfettiCannon from 'react-native-confetti-cannon';


type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

/* Mapa estático de insignias */
const badgeMap: Record<string, any> = {
  agriculture: require('../../assets/images/badges/badge_agriculture.png'),
  water:       require('../../assets/images/badges/badge_water.png'),
  air:         require('../../assets/images/badges/badge_air.png'),
  pollution:   require('../../assets/images/badges/badge_pollution.png'),
};

const { width } = Dimensions.get('window');

export default function ResultsScreen({ route, navigation }: Props) {
  const { lessonId, correct, total } = route.params;
  const { gainBadge } = useProgress();
  const { sfx } = useAudio();

  const passed = correct === total;
  const lessonKey = lessons[lessonId].key as keyof typeof badgeMap;
  const badgeImg  = badgeMap[lessonKey];

  /* Otorga insignia y SFX */
  useEffect(() => {
    if (passed) {
      gainBadge(lessonId);
      sfx('badge');
    } else {
      sfx('incorrect');
    }
  }, [passed, lessonId]);   // ← dependencias reales

  return (
    <View style={styles.container}>
      {passed && (
        /* Confeti una sola vez (count=120, origin arriba-centro) */
        <ConfettiCannon
          count={120}
          origin={{ x: width / 2, y: -20 }}
          fadeOut
        />
      )}
      {passed ? (
        <>
          <Image source={badgeImg} style={styles.badge} />
          <Text style={styles.title}>¡Insignia conseguida!</Text>
        </>
      ) : (
        <Text style={styles.title}>Repasa la lección y vuelve a intentarlo</Text>
      )}

      <Text style={styles.score}>
        {correct}/{total} correctas
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.replace('CourseSelect')} /* vuelve al menú */
      >
        <Text style={styles.btnText}>Volver al Menú</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  badge:      { width: 180, height: 180, marginBottom: 20 },
  title:      { fontFamily: 'NunitoBold', fontSize: 24, textAlign: 'center', marginBottom: 14 },
  score:      { fontFamily: 'NunitoRegular', fontSize: 18, marginBottom: 30 },
  btn:        { backgroundColor: '#B57BFF', padding: 14, borderRadius: 14 },
  btnText:    { color: '#fff', fontFamily: 'NunitoBold', fontSize: 18 },
});

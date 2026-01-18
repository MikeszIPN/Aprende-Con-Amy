import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import lessons from '../data/lessons.json';
import { useProgress } from '../context/ProgressContext';
import { useAudio } from '../context/AudioContext';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

const PURPLE = '#A362FF'; 
const DARK_PURPLE = '#8549DB';
const GREEN = '#4CAF50';
const LIGHT_PURPLE = '#F8F4FF';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

const badgeMap: Record<string, any> = {
  agriculture: require('../../assets/images/badges/badge_agriculture.png'),
  water:       require('../../assets/images/badges/badge_water.png'),
  air:         require('../../assets/images/badges/badge_air.png'),
  pollution:   require('../../assets/images/badges/badge_pollution.png'),
};

export default function ResultsScreen({ route, navigation }: Props) {
  const { lessonId, correct, total } = route.params;
  const { gainBadge } = useProgress();
  const { sfx } = useAudio();

  const passed = correct === total;
  const lessonKey = lessons[lessonId].key as keyof typeof badgeMap;
  const badgeImg  = badgeMap[lessonKey];

  useEffect(() => {
    if (passed) {
      gainBadge(lessonId);
      sfx('badge');
    } else {
      sfx('incorrect');
    }
  }, [passed, lessonId]);

  return (
    <View style={styles.container}>
      {passed && (
        <ConfettiCannon
          count={150}
          origin={{ x: width / 2, y: -20 }}
          fadeOut
          fallSpeed={3000}
        />
      )}

      <View style={styles.resultsCard}>
        {passed ? (
          <>
            <View style={styles.badgeWrapper}>
              <Image source={badgeImg} style={styles.badge} resizeMode="contain" />
            </View>
            <Text style={styles.celebrationText}>¡EXCELENTE TRABAJO!</Text>
            <Text style={styles.title}>Has ganado la insignia de {lessons[lessonId].title}</Text>
          </>
        ) : (
          <>
            <View style={styles.badgeWrapper}>
              <Text style={{fontSize: 80}}>📚</Text>
            </View>
            <Text style={[styles.celebrationText, { color: '#FF5C5C' }]}>¡CASI LO LOGRAS!</Text>
            <Text style={styles.title}>Repasa la lección para obtener tu insignia</Text>
          </>
        )}

        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>
             Puntuación: {correct} / {total}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.btn}
        onPress={() => navigation.replace('CourseSelect')}
      >
        <Text style={styles.btnText}>VOLVER AL MENÚ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#fff' 
  },
  resultsCard: {
    width: '100%',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#E8D8FF',
  },
  badgeWrapper: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  badge: { 
    width: 150, 
    height: 150 
  },
  celebrationText: {
    fontFamily: 'NunitoBold',
    fontSize: 28,
    color: GREEN,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: { 
    fontFamily: 'NunitoBold', 
    fontSize: 18, 
    textAlign: 'center', 
    color: '#555',
    marginBottom: 25,
    paddingHorizontal: 10
  },
  scoreBadge: {
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: { 
    fontFamily: 'NunitoBold', 
    fontSize: 20, 
    color: '#fff',
    fontWeight: 'bold'
  },
  btn: { 
    backgroundColor: PURPLE, 
    width: width * 0.8,
    paddingVertical: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: DARK_PURPLE,
  },
  btnText: { 
    color: '#fff', 
    fontFamily: 'NunitoBold', 
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2
  },
});
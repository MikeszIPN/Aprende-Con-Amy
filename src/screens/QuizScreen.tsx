// src/screens/QuizScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import lessons from '../data/lessons.json';
import { useAudio } from '../context/AudioContext';
import * as Progress from 'react-native-progress';
import { Dimensions } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

const { width } = Dimensions.get('window');

export default function QuizScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const quiz = lessons[lessonId].quiz;
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const { sfx } = useAudio();
  const current = quiz[index];
  const totalQuestions = quiz.length;


  const answer = (opt: number) => {
    const isCorrect = opt === current.answer;
    sfx(isCorrect ? 'correct' : 'incorrect');
    Vibration.vibrate(80);
    if (isCorrect) setCorrectCount((c) => c + 1);

    if (index === quiz.length - 1) {
      navigation.replace('Results', {
        lessonId,
        correct: isCorrect ? correctCount + 1 : correctCount,
        total: quiz.length,
      });
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.q}>{current.question}</Text>

      {/* Opciones */}
      {current.options.map((op: string, i: number) => (
        <TouchableOpacity key={i} style={styles.opt} onPress={() => answer(i)}>
          <Text style={styles.optText}>{op}</Text>
        </TouchableOpacity>
      ))}

      {/* Barra de progreso */}
      <View style={styles.progressBox}>
        <Progress.Bar
          progress={(index + 1) / totalQuestions}
          width={width * 0.8}
          height={8}
          color="#7B3AED"
          unfilledColor="#E0CFFB"
          borderWidth={0}
          borderRadius={4}
        />
        <Text style={styles.progressTxt}>
          Pregunta {index + 1}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  q: { fontFamily: 'NunitoBold', fontSize: 22, marginBottom: 16, textAlign: 'center' },
  opt: { backgroundColor: '#2196F3', padding: 14, borderRadius: 12, marginVertical: 6 },
  optText: { color: '#fff', fontFamily: 'NunitoBold', fontSize: 18 },
  /* --- barra y texto --- */
  progressBox: { alignItems: 'center', marginTop: 24 },
  progressTxt: { marginTop: 6, fontFamily: 'NunitoBold', color: '#7B3AED' },
});

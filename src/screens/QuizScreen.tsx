import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Image, SafeAreaView } from 'react-native';
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
  const [selectedOption, setSelectedOption] = useState<number | null>(null); 
  
  const { sfx } = useAudio();
  const current = quiz[index];
  const totalQuestions = quiz.length;

  const answer = (optIndex: number) => {

    setSelectedOption(optIndex);

    const isCorrect = optIndex === current.answer;
    sfx(isCorrect ? 'correct' : 'incorrect');
    Vibration.vibrate(80);

   
    setTimeout(() => {
      const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
      if (isCorrect) setCorrectCount(newCorrectCount);

      if (index === quiz.length - 1) {
        navigation.navigate('Results', {
          lessonId,
          correct: newCorrectCount,
          total: quiz.length,
        });
      } else {
        setIndex((i) => i + 1);
        setSelectedOption(null); // Limpiamos la selección para la siguiente pregunta
      }
    }, 400); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/188/188333.png' }} 
            style={styles.image} 
          />
          <Text style={styles.questionText}>{current.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {current.options.map((op: string, i: number) => {
            
            const isSelected = selectedOption === i;

            return (
              <TouchableOpacity 
                key={i} 
                activeOpacity={0.9}
                disabled={selectedOption !== null} 
                style={[
                  styles.opt, 
                  isSelected && styles.optSelected 
                ]} 
                onPress={() => answer(i)}
              >
                <Text style={[styles.optText, isSelected && styles.optTextSelected]}>
                  {op}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressWrapper}>
             <Progress.Bar
              progress={(index + 1) / totalQuestions}
              width={width * 0.85}
              height={14}
              color="#A855F7"
              unfilledColor="#F3E8FF"
              borderWidth={0}
              borderRadius={10}
            />
            <View style={[styles.progressIcon, { left: `${((index + 1) / totalQuestions) * 85}%` }]}>
                <Text style={{fontSize: 20}}>🪴</Text>
            </View>
        </View>
        <Text style={styles.progressTxt}>Pregunta {index + 1}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 25, paddingTop: 40 },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 40,
  },
  image: { width: 100, height: 100, resizeMode: 'contain' },
  questionText: { 
    flex: 1, 
    fontFamily: 'NunitoBold', 
    fontSize: 20, 
    color: '#333', 
    marginLeft: 15,
    lineHeight: 26
  },
  optionsContainer: { gap: 15 },
  opt: { 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 18, 
    paddingHorizontal: 20,
    borderRadius: 18, 
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderBottomWidth: 6,
  },
  optSelected: {
    backgroundColor: '#F3E8FF', 
    borderColor: '#A855F7',     
    borderBottomWidth: 2,       
    marginTop: 4,              
  },
  optText: { 
    color: '#4B5563', 
    fontFamily: 'NunitoBold', 
    fontSize: 18, 
    textAlign: 'center' 
  },
  optTextSelected: { 
    color: '#7E22CE', 
    fontWeight: 'bold' 
  },
  footer: { paddingBottom: 40, alignItems: 'center' },
  progressWrapper: { width: width * 0.85, height: 40, justifyContent: 'center' },
  progressIcon: { 
    position: 'absolute', 
    top: -5, 
    zIndex: 10,
    marginLeft: -15 
  },
  progressTxt: { marginTop: 10, fontFamily: 'NunitoBold', color: '#9CA3AF', fontSize: 16 },
});
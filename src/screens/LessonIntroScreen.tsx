// src/screens/LessonIntroScreen.tsx
import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import lessons from '../data/lessons.json';
import { useAudio } from '../context/AudioContext';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonIntro'>;

export default function LessonIntroScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const { title } = lessons[lessonId];
  const { sfx } = useAudio();

  return (
    <ImageBackground source={require('../../assets/default-bg.png')} style={styles.bg}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            sfx('next');
            navigation.navigate('InfoCarousel', { lessonId });
          }}>
          <Text style={styles.btnText}>Comenzar lección</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: 'rgba(255,255,255,0.85)', margin: 20, padding: 24, borderRadius: 16 },
  title: { fontFamily: 'NunitoBold', fontSize: 24, marginBottom: 12, textAlign: 'center' },
  body: { fontFamily: 'NunitoRegular', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  btn: { backgroundColor: '#2196F3', padding: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontFamily: 'NunitoBold', fontSize: 18 },
});

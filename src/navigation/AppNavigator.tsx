// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen              from '../screens/HomeScreen';
import LessonIntroScreen       from '../screens/LessonIntroScreen';
import InfoCarouselScreen      from '../screens/InfoCarouselScreen';
import QuizScreen              from '../screens/QuizScreen';
import ResultsScreen           from '../screens/ResultsScreen';
import BadgeCollectionScreen   from '../screens/BadgeCollectionScreen';
import CreditsScreen           from '../screens/CreditsScreen';
import CourseSelectScreen from '../screens/CourseSelectScreen';
import CongratulationsScreen   from '../screens/CongratulationsScreen';

/* ---------- Tipos de parámetros para cada ruta ---------- */
export type RootStackParamList = {
  Home:          undefined;
  CourseSelect: undefined;
  LessonIntro:   { lessonId: number };
  InfoCarousel:  { lessonId: number };
  Quiz:          { lessonId: number };
  Results:       { lessonId: number; correct: number; total: number };
  Badges:        undefined;
  Credits:       { autoHome?: boolean };
  Congrats: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/* -------------------------------------------------------- */
export default function AppNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home"         component={HomeScreen} />
      <Stack.Screen name="CourseSelect" component={CourseSelectScreen} />
      <Stack.Screen name="LessonIntro"  component={LessonIntroScreen} />
      <Stack.Screen name="InfoCarousel" component={InfoCarouselScreen} />
      <Stack.Screen name="Quiz"         component={QuizScreen} />
      <Stack.Screen name="Results"      component={ResultsScreen} />
      <Stack.Screen name="Badges"       component={BadgeCollectionScreen} />
      <Stack.Screen name="Credits"      component={CreditsScreen} />
      <Stack.Screen name="Congrats" component={CongratulationsScreen} />
    </Stack.Navigator>
  );
}

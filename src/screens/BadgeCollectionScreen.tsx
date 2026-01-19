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

const { width } = Dimensions.get('window');


const PURPLE = '#A362FF'; 
const DARK_PURPLE = '#8549DB';
const LIGHT_PURPLE = '#F8F4FF';

type Props = NativeStackScreenProps<RootStackParamList, 'Badges'>;

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

  const completedCount = progress.badges.filter(Boolean).length;
  const total = lessons.length;
  const percent = Math.round((completedCount / total) * 100);

  const goHome = () => {
    sfx('next');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mis Insignias</Text>

        {/* Resumen de trofeos */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
             {completedCount} de {total} obtenidas
          </Text>
        </View>

        {/* Rejilla de insignias */}
        <View style={styles.grid}>
          {lessons.map((lesson, i) => {
            const key = lesson.key as keyof typeof unlocked;
            const isUnlocked = progress.badges[i];
            const img = isUnlocked ? unlocked[key] : locked[key];

            return (
              <View key={key} style={[styles.badgeCard, !isUnlocked && styles.badgeLocked]}>
                <View style={styles.imageWrapper}>
                  <Image source={img} style={styles.badgeImg} resizeMode="contain" />
                </View>
                <Text style={styles.badgeTitle}>{lesson.title}</Text>
                {!isUnlocked && <Text style={styles.lockLabel}>Bloqueado</Text>}
              </View>
            );
          })}
        </View>

        <Text style={styles.progressMsg}>
          {percent === 100
            ? '¡Eres un experto del medio ambiente!'
            : `¡Llevas un ${percent}%! Sigue aprendiendo para completar tu colección.`}
        </Text>

        {/* Botón 3D Cuadrado */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.btn} 
          onPress={goHome}
        >
          <Text style={styles.btnText}>VOLVER AL INICIO</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 60) / 2;

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  container: { 
    alignItems: 'center', 
    paddingVertical: 30, 
    paddingHorizontal: 20 
  },
  title: { 
    fontFamily: 'NunitoBold', 
    fontSize: 32, 
    color: PURPLE, 
    fontWeight: '800',
    marginBottom: 10 
  },
  summaryCard: {
    backgroundColor: LIGHT_PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  summaryText: {
    fontFamily: 'NunitoBold',
    color: PURPLE,
    fontSize: 18,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  /* Tarjetas de Insignias */
  badgeCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    margin: 8,
    alignItems: 'center',
    // Sutil efecto de elevación
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderBottomWidth: 6,
    borderBottomColor: '#E0E0E0',
  },
  badgeLocked: {
    opacity: 0.7,
    backgroundColor: '#F9F9F9',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 10,
  },
  badgeImg: { 
    width: '100%', 
    height: '100%' 
  },
  badgeTitle: { 
    fontFamily: 'NunitoBold', 
    fontSize: 14, 
    textAlign: 'center', 
    color: '#333',
    fontWeight: '700'
  },
  lockLabel: {
    fontSize: 10,
    color: '#AAA',
    textTransform: 'uppercase',
    marginTop: 4,
    fontWeight: 'bold',
  },
  progressMsg: { 
    marginVertical: 30, 
    fontFamily: 'NunitoBold', 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#666',
    lineHeight: 22,
  },
  btn: { 
    backgroundColor: PURPLE, 
    width: '100%',
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: DARK_PURPLE,
    marginBottom: 20,
  },
  btnText: { 
    color: '#fff', 
    fontFamily: 'NunitoBold', 
    fontSize: 20, 
    fontWeight: '900',
    letterSpacing: 1.2
  },
});
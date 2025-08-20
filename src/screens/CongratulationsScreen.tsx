import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAudio } from '../context/AudioContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Congrats'>;

export default function CongratulationsScreen({ navigation }: Props) {
  const { sfx } = useAudio();

  useEffect(() => {
    sfx('complete');
    /* 4 s después → Créditos, luego Home */
    const t1 = setTimeout(() => navigation.replace('Credits', { autoHome:true }), 4000);
    return () => clearTimeout(t1);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.big}>🎉 ¡Felicidades! 🎉</Text>
      <Text style={styles.msg}>
        Completaste los 4 cursos y obtuviste todas las insignias.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, alignItems:'center', justifyContent:'center', padding:24 },
  big:{ fontSize:32, fontFamily:'NunitoBold', marginBottom:20, textAlign:'center' },
  msg:{ fontSize:18, fontFamily:'NunitoRegular', textAlign:'center' },
});

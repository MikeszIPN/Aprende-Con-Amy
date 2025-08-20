/**
 * Botón reutilizable para cada opción del quiz.
 * Cambia de color según su estado (default, correcta, incorrecta).
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type State = 'default' | 'correct' | 'incorrect';

type Props = {
  label: string;
  onPress: () => void;
  /** Estado de la opción para colorear feedback */
  state?: State;
  disabled?: boolean;
};

export default function QuizOption({
  label,
  onPress,
  state = 'default',
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, colorByState(state)]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

/* Devuelve estilo de fondo según el estado */
const colorByState = (state: State) => {
  switch (state) {
    case 'correct':
      return { backgroundColor: '#4CAF50' }; // verde
    case 'incorrect':
      return { backgroundColor: '#F44336' }; // rojo
    default:
      return { backgroundColor: '#2196F3' }; // azul normal
  }
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginVertical: 8,
  },
  text: { color: '#fff', fontFamily: 'NunitoBold', fontSize: 18, textAlign: 'center' },
});

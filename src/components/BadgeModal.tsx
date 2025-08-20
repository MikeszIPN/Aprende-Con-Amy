/**
 * Muestra un modal de celebración cuando el usuario gana una insignia.
 */

import React from 'react';
import {
  Modal,
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
  /** `true` para mostrar el modal */
  visible: boolean;
  /** Función que se ejecuta al cerrar el modal */
  onClose: () => void;
  /** Imagen PNG de la insignia ganada (require('...')) */
  badge: any;
  /** Título mostrado sobre la insignia */
  title?: string;
  /** Mensaje opcional debajo de la insignia */
  message?: string;
};

export default function BadgeModal({
  visible,
  onClose,
  badge,
  title = '¡Insignia conseguida!',
  message = '¡Sigue aprendiendo con Amy!',
}: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          <Image source={badge} style={styles.badge} />

          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.8,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: { fontFamily: 'NunitoBold', fontSize: 22, marginBottom: 12, textAlign: 'center' },
  badge: { width: 150, height: 150, marginBottom: 16 },
  message: {
    fontFamily: 'NunitoRegular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: { backgroundColor: '#4CAF50', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  btnText: { color: '#fff', fontFamily: 'NunitoBold', fontSize: 18 },
});

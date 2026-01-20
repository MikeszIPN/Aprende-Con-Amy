import React, { useRef, useState, useEffect } from 'react';
import {
  FlatList,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import lessons from '../data/lessons.json';
import Slide from '../components/Slide';
import { useAudio } from '../context/AudioContext';
import { useVideoPlayer } from 'expo-video';

const { width } = Dimensions.get('window');

// 1. Usamos la paleta de colores completa de para el nuevo diseño UI
const COLORS = {
  PURPLE: '#AF70FF',
  PURPLE_DARK: '#9353E1',
  WHITE: '#FFFFFF',
  GRAY_BORDER: '#E5E5E5',
  GRAY_TEXT: '#777777',
  GRAY_DOT: '#E5E5E5',
  TEXT_MAIN: '#4B4B4B',
  RED: '#F44336',
};

type Props = NativeStackScreenProps<RootStackParamList, 'InfoCarousel'>;

/* --- Mapas de Assets --- */
const videoMap = {
  agriculture_intro: require('../../assets/videos/agriculture_intro.mp4'),
  water_intro:       require('../../assets/videos/water_intro.mp4'),
  air_intro:         require('../../assets/videos/air_intro.mp4'),
  pollution_intro:   require('../../assets/videos/pollution_intro.mp4'),
};

const imageMap = {
  rotacion: require('../../assets/images/infografias/rotacion.png'),
  compost: require('../../assets/images/infografias/compost.png'),
  riego: require('../../assets/images/infografias/riego.png'),
  biodiversidad: require('../../assets/images/infografias/biodiversidad.png'),
  gota: require('../../assets/images/infografias/gota.png'),
  ducha: require('../../assets/images/infografias/ducha.png'),
  desague: require('../../assets/images/infografias/desague.png'),
  lluvia: require('../../assets/images/infografias/lluvia.png'),
  pulmones: require('../../assets/images/infografias/pulmones.png'),
  humo: require('../../assets/images/infografias/humo.png'),
  bici: require('../../assets/images/infografias/bici.png'),
  arbol: require('../../assets/images/infografias/arbol.png'),
  basura: require('../../assets/images/infografias/basura.png'),
  '3r': require('../../assets/images/infografias/3r.png'),
  separacion: require('../../assets/images/infografias/separacion.png'),
  reutilizable: require('../../assets/images/infografias/reutilizable.png'),
};

export default function InfoCarouselScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const insets = useSafeAreaInsets();

  const { pauseMusic, resumeMusic, playNarration, stopNarration, sfx } = useAudio();

  const slides: any[] = (lessons as any)[lessonId].slides.map((s: any) => {
    if (s.type === 'video') {
      const videoKey = s.video.replace('.mp4', '') as keyof typeof videoMap;
      return { ...s, video: videoMap[videoKey] };
    }
    if (s.type === 'content') {
      const key = s.image.replace('.png', '') as keyof typeof imageMap;
      // Extraer key de audio
      const audioKey = s.audio ? s.audio.replace('.mp3', '') : null;
      return { ...s, image: imageMap[key], audioKey };
    }
    return s;
  });

  const flat = useRef<FlatList<any>>(null);
  const [index, setIndex] = useState(0);
  
  // Estados para el video
  const [videoFinished, setVideoFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Configuración del Player
  const videoIndex = slides.findIndex((s) => s.type === 'video');
  const videoSource = videoIndex !== -1 ? (slides[videoIndex] as any).video : null;
  
  const player = useVideoPlayer(videoSource as any, (p) => {
    p.loop = false;
  });

  // Efecto para controlar Play/Pause del video
  useEffect(() => {
    if (!player || videoIndex === -1) return;
    if (index === videoIndex) {
      if (isPlaying && !videoFinished) {
        player.play();
      } else {
        player.pause();
      }
    } else {
      player.pause();
      setIsPlaying(false);
    }
  }, [index, videoIndex, player, isPlaying, videoFinished]);

  // Reproducción automática de narración
  useEffect(() => {
    const currentSlide = slides[index];
    // Si es contenido y tiene audio, reproducir narración
    if (currentSlide?.type === 'content' && currentSlide.audioKey) {
      playNarration(currentSlide.audioKey);
    } else {
      stopNarration();
    }
    // Cleanup al desmontar o cambiar slide
    return () => { stopNarration(); };
  }, [index]);

  // Función para re-escuchar
  const handleReplay = () => {
    const currentSlide = slides[index];
    if (currentSlide?.audioKey) playNarration(currentSlide.audioKey);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Botón Cerrar:*/}
      <View style={[styles.closeBtnContainer, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.closeBtn3D}
          onPress={() => {
            try { player?.pause(); } catch (e) { /* ignore */ }
            stopNarration();
            resumeMusic();
            navigation.goBack();
          }}>
          <View style={styles.closeBtnInside}>
            <Text style={styles.closeTxt}>✕</Text>
          </View>
          <View style={styles.closeBtnShadow} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flat}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onMomentumScrollEnd={({ nativeEvent }) => {
          const newIndex = Math.round(nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
          // Lógica mixta: pausar música de fondo si hay video, sino reanudar
          if (slides[newIndex]?.type === 'video') { 
            pauseMusic(); 
          } else { 
            resumeMusic(); 
          }
        }}
        renderItem={({ item, index: idx }) => (
          <View style={{ width, flex: 1 }}>
            {item.type === 'video' ? (
              <View style={styles.videoWrapper}>
                {/* Slide de Video: (expo-video + controles) */}
                <Slide
                  {...item}
                  player={player}
                  onVideoEnd={() => {
                    setIsPlaying(false);
                    setVideoFinished(true);
                  }}
                  topOffset={insets.top} // Ajuste visual
                />

                {/* Controles de Video - anclado al borde inferior del video */}
                <View style={styles.playCtrlOverlay}>
                  <TouchableOpacity
                    style={styles.playCtrl3D}
                    onPress={() => {
                      if (videoFinished) {
                        player.currentTime = 0;
                        setVideoFinished(false);
                        setIsPlaying(true);
                        player?.play();
                        return;
                      }
                      if (isPlaying) {
                        player?.pause();
                        setIsPlaying(false);
                      } else {
                        setIsPlaying(true);
                        player?.play();
                      }
                    }}
                  >
                    <View style={styles.playCtrlInside}>
                      {videoFinished ? (
                        idx === 1 ? <Text style={styles.playCtrlIcon}>▶</Text> : <Text style={styles.playCtrlIcon}>↻</Text>
                      ) : isPlaying ? (
                        <View style={styles.pauseIcon}>
                          <View style={styles.pauseBar} />
                          <View style={styles.pauseBar} />
                        </View>
                      ) : (
                        <Text style={styles.playCtrlIcon}>▶</Text>
                      )}
                    </View>
                    <View style={styles.playCtrlShadow} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Slide de Contenido */}
                <Slide {...item} play={idx === index} topOffset={insets.top + 80} />
                
                {/* Botón "Escuchar Explicación" */}
                {item.audioKey && (
                  <View style={[styles.bottomActionContainer, { bottom: insets.bottom + 110 }]}>
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      style={styles.actionBtn3D} 
                      onPress={handleReplay}
                    >
                      <View style={[styles.btnInside, styles.btnWhite]}>
                        <Text style={styles.btnText}>ESCUCHAR EXPLICACIÓN</Text>
                      </View>
                      <View style={[styles.btnShadow, { backgroundColor: COLORS.PURPLE }]} />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      />

      {/* Dots: Estilo (Rectangulares) */}
      <View style={[styles.dotsContainer, { bottom: insets.bottom + 10}]}>
        {slides.map((_: any, i: number) => (
          <View 
            key={i} 
            style={[
              styles.dot, 
              i === index ? styles.dotActive : styles.dotInactive
            ]} 
          />
        ))}
      </View>

      {/* Botón Quiz: Lógica (navegación) con Estilo 3D */}
      {index === slides.length - 1 && slides[index]?.type !== 'video' && (
        <View style={[styles.bottomActionContainer, { bottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionBtn3D}
            onPress={() => { 
              if(sfx) sfx('next');
              stopNarration(); 
              navigation.replace('Quiz', { lessonId });
            }}
          >
            <View style={[styles.btnInside, { backgroundColor: COLORS.PURPLE }]}>
              <Text style={[styles.btnText, { color: COLORS.WHITE }]}>¡EMPEZAR QUIZ!</Text>
            </View>
            <View style={[styles.btnShadow, { backgroundColor: COLORS.PURPLE_DARK }]} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.WHITE },
  
  // Estilo Close Button 3D
  closeBtnContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  closeBtn3D: { 
    width: 40, 
    height: 46,
  },
  closeBtnInside: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.GRAY_BORDER,
    zIndex: 2,
  },
  closeBtnShadow: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.GRAY_BORDER,
    zIndex: 1,
  },
  closeTxt: { color: '#ff0000', fontSize: 18, fontWeight: 'bold' },

  // Estilos Botones 3D
  bottomActionContainer: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 25,
    alignItems: 'center',
    zIndex: 5,
  },
  actionBtn3D: { width: '100%', height: 60 },
  btnInside: {
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  btnWhite: { backgroundColor: COLORS.WHITE, borderWidth: 2, borderColor: COLORS.PURPLE },
  btnShadow: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 54,
    borderRadius: 18,
    zIndex: 1,
  },
  btnText: { 
    fontFamily: 'Nunito-Bold', 
    fontSize: 16, 
    letterSpacing: 0.5,
    textAlign: 'center',
    color: COLORS.PURPLE
  },

  // Dots
  dotsContainer: { 
    position: 'absolute', 
    flexDirection: 'row', 
    alignSelf: 'center',
    alignItems: 'center'
  },
  dot: { height: 10, borderRadius: 5, marginHorizontal: 5 },
  dotActive: { width: 20, backgroundColor: COLORS.PURPLE },
  dotInactive: { width: 10, backgroundColor: COLORS.GRAY_DOT },

  // Controles de Video 3D
  videoWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  playCtrlOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: -31, // center of 62px button aligns with video bottom
    zIndex: 12,
  },
  playCtrl3D: {
    width: 56,
    height: 62,
  },
  playCtrlInside: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  playCtrlShadow: {
    position: 'absolute',
    bottom: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PURPLE_DARK,
    zIndex: 1,
  },
  playCtrlIcon: { color: '#fff', fontSize: 24, marginLeft: 2 },
  pauseIcon: { flexDirection: 'row', gap: 4 },
  pauseBar: { width: 4, height: 20, backgroundColor: '#fff', borderRadius: 2 },
});
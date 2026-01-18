import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import lessons from '../data/lessons.json';
import Slide from '../components/Slide';
import { useAudio } from '../context/AudioContext';

const { width } = Dimensions.get('window');

const COLORS = {
  PURPLE: '#AF70FF',
  PURPLE_DARK: '#9353E1',
  WHITE: '#FFFFFF',
  GRAY_BORDER: '#E5E5E5',
  GRAY_TEXT: '#777777',
  GRAY_DOT: '#E5E5E5',
  TEXT_MAIN: '#4B4B4B',
};

type Props = NativeStackScreenProps<RootStackParamList, 'InfoCarousel'>;

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

  const slides = (lessons as any)[lessonId].slides.map((s: any) => {
    if (s.type === 'video') {
      const videoKey = s.video.replace('.mp4', '') as keyof typeof videoMap;
      return { ...s, video: videoMap[videoKey] };
    }
    if (s.type === 'content') {
      const key = s.image.replace('.png', '') as keyof typeof imageMap;
      const audioKey = s.audio ? s.audio.replace('.mp3', '') : null;
      return { ...s, image: imageMap[key], audioKey: audioKey }; 
    }
    return s;
  });

  const flat = useRef<FlatList<any>>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const currentSlide = slides[index];
    if (currentSlide?.type === 'content' && currentSlide.audioKey) {
      playNarration(currentSlide.audioKey);
    } else {
      stopNarration();
    }
    return () => { stopNarration(); };
  }, [index]);

  const handleReplay = () => {
    const currentSlide = slides[index];
    if (currentSlide?.audioKey) playNarration(currentSlide.audioKey);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 10 }]}
        onPress={() => { 
          stopNarration(); 
          resumeMusic(); 
          navigation.replace('CourseSelect'); 
        }}>
        <Text style={styles.closeTxt}>✕</Text>
      </TouchableOpacity>

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
          if (slides[newIndex]?.type === 'video') { pauseMusic(); } 
          else { resumeMusic(); }
        }}
        renderItem={({ item, index: idx }) => (
          <View style={{ width, flex: 1 }}>
            {/* Aumentamos el topOffset a 80 para bajar el contenido */}
            <Slide {...item} play={idx === index} topOffset={insets.top + 80} />
            
            {item.type === 'content' && item.audioKey && (
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
          </View>
        )}
      />

      <View style={[styles.dotsContainer, { bottom: insets.bottom + 55 }]}>
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

      {index === slides.length - 1 && (
        <View style={[styles.bottomActionContainer, { bottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionBtn3D}
            onPress={() => { 
              sfx('next'); 
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
  closeBtn: { 
    position: 'absolute', 
    right: 20, 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 10,
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.GRAY_BORDER,
  },
  closeTxt: { color: '#BDBDBD', fontSize: 18, fontWeight: 'bold' },
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
  btnIcon: { fontSize: 22, marginRight: 10 },
  dotsContainer: { 
    position: 'absolute', 
    flexDirection: 'row', 
    alignSelf: 'center',
    alignItems: 'center'
  },
  dot: { height: 10, borderRadius: 5, marginHorizontal: 5 },
  dotActive: { width: 25, backgroundColor: COLORS.PURPLE },
  dotInactive: { width: 10, backgroundColor: COLORS.GRAY_DOT },
});
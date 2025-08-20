import React, { useRef, useState } from 'react';
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
import Slide, { SlideType } from '../components/Slide';
import { useAudio } from '../context/AudioContext';

const { width } = Dimensions.get('window');
const PURPLE = '#B57BFF';
const RED    = '#F44336';

type Props = NativeStackScreenProps<RootStackParamList, 'InfoCarousel'>;

/* --- mapas de assets --- (ajusta si cambian rutas) */
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
/* --------------------------------------------- */

export default function InfoCarouselScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const insets = useSafeAreaInsets();
  const { pauseMusic, resumeMusic } = useAudio();

  /* construir slides (ya incluyen intro y preQuiz en JSON) */
  const slides: SlideType[] = lessons[lessonId].slides.map((s:any) => {
    if (s.type==='video') {
      const videoKey = s.video.replace('.mp4', '') as keyof typeof videoMap;
      return { ...s, video: videoMap[videoKey] };
    }
    if (s.type==='content') {
      const key = s.image.replace('.png', '') as keyof typeof imageMap;
      return { ...s, image: imageMap[key] };
    }
    return s;
  });

  const flat = useRef<FlatList<any>>(null);
  const [index, setIndex] = useState(0);

  return (
    <SafeAreaView style={styles.safe}>
      {/* botón cerrar */}
      <TouchableOpacity
        style={[styles.close,{ top:insets.top+8 }]}
        onPress={() => { resumeMusic(); navigation.replace('CourseSelect'); }}>
        <Text style={styles.closeTxt}>✕</Text>
      </TouchableOpacity>

      {/* carrusel swipe */}
      <FlatList
        ref={flat}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_,i)=>i.toString()}
        renderItem={({ item, index: idx })=>(
          <View style={{ width }}>
            <Slide
              {...item}
              play={idx === index}
              topOffset={insets.top + 56}
            />
          </View>
        )}
        onMomentumScrollEnd={({ nativeEvent }) => {
          const newIndex = Math.round(nativeEvent.contentOffset.x / width);
          setIndex(newIndex);

          if (slides[newIndex]?.type === 'video') {
            pauseMusic();
          } else {
            resumeMusic();
          }
        }}
      />

      {/* dots */}
      <View style={styles.dots}>
        {slides.map((_,i)=>(
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: i===index ? 1 : 0.3, transform:[{ scale:i===index?1.2:1 }]},
            ]}
          />
        ))}
      </View>

      {/* Quiz button - solo si no es el último slide o si es un video */}
      {index === slides.length - 1 && slides[index]?.type !== 'video' && (
        <TouchableOpacity
          style={[
            styles.quizBtn,
            { bottom: insets.bottom + 68 },
          ]}
          onPress={() => navigation.replace('Quiz', { lessonId })}
        >
          <Text style={styles.quizBtnTxt}>Ir al Quiz</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* ---------------- estilos ---------------- */
const DOT = 8;
const styles = StyleSheet.create({
  safe:{ flex:1, backgroundColor:'#fff' },
  close:{ position:'absolute', right:14,
          backgroundColor:RED,width:38,height:38,borderRadius:19,
          alignItems:'center',justifyContent:'center',zIndex:10 },
  closeTxt:{ color:'#fff', fontSize:22, fontFamily:'NunitoBold' },
  /* dots */
  dots:{ position:'absolute', bottom:20, width:'100%', flexDirection:'row',
         justifyContent:'center', alignItems:'center' },
  dot:{ width:DOT, height:DOT, borderRadius:DOT/2,
        backgroundColor:PURPLE, marginHorizontal:4 },
  quizBtn: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: PURPLE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  quizBtnTxt: {
    color: '#fff',
    fontFamily: 'NunitoBold',
    fontSize: 16,
  },
});

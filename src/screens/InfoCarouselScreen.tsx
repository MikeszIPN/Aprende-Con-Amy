import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import lessons from '../data/lessons.json';
import Slide from '../components/Slide';
import { useAudio } from '../context/AudioContext';
import { useVideoPlayer } from 'expo-video';

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
  const [videoFinished, setVideoFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  /* Video player management - keep a single player instance */
  const videoIndex = slides.findIndex((s: any) => s.type === 'video');
  const videoSource = videoIndex !== -1 ? (slides[videoIndex] as any).video : null;
  const player = useVideoPlayer(videoSource as any, (p) => {
    p.loop = false;
  });

  // Control play/pause based on visible slide; restart only after a completed playback
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

  // (No cleanup pause) to avoid native errors on fast unmount; playback is controlled before navigation

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
        style={[styles.close,{ top:insets.top+8 }]}
        onPress={() => {
          try { player?.pause(); } catch (e) { /* ignore */ }
          resumeMusic();
          navigation.goBack();
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
        keyExtractor={(_,i)=>i.toString()}
        renderItem={({ item, index: idx }) => (
          <View style={{ width, flex: 1 }}>
            {item.type === 'video' ? (
              <>
                <Slide
                  {...item}
                  player={player}
                  onVideoEnd={() => {
                    setIsPlaying(false);
                    setVideoFinished(true);
                  }}
                  topOffset={insets.top + 56}
                />
                {/* Play/Pause/Repeat control for video slide */}
                <TouchableOpacity
                  style={[styles.playCtrl, { bottom: insets.bottom }]}
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
                  {videoFinished ? (
                    idx === 1 ? (
                      // On 2nd slide, show Play icon instead of Repeat
                      <Text style={styles.playCtrlIcon}>▶</Text>
                    ) : (
                      <Text style={styles.playCtrlIcon}>↻</Text>
                    )
                  ) : isPlaying ? (
                    <View style={styles.pauseIcon}>
                      <View style={styles.pauseBar} />
                      <View style={styles.pauseBar} />
                    </View>
                  ) : (
                    <Text style={styles.playCtrlIcon}>▶</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Slide
                  {...item}
                  topOffset={insets.top + 80}
                />
                
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
        onMomentumScrollEnd={({ nativeEvent }) => {
          const newIndex = Math.round(nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
          if (slides[newIndex]?.type === 'video') { pauseMusic(); } 
          else { resumeMusic(); }
        }}
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

      {/* Quiz button - solo si no es el último slide o si es un video */}
      {index === slides.length - 1 && slides[index]?.type !== 'video' && (
        <TouchableOpacity
          style={[
            styles.quizBtn,
            { bottom: insets.bottom + 68 },
          ]}
          onPress={() => navigation.navigate('Quiz', { lessonId })}
        >
          <Text style={styles.quizBtnTxt}>Ir al Quiz</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{ flex:1, backgroundColor:'#fff' },
  close:{ position:'absolute', right:14,
          backgroundColor:COLORS.PURPLE,width:38,height:38,borderRadius:19,
          alignItems:'center',justifyContent:'center',zIndex:10 },
  closeTxt:{ color:'#fff', fontSize:22, fontFamily:'NunitoBold' },
  /* dots */
  dotsContainer:{ position:'absolute', bottom:20, width:'100%', flexDirection:'row',
         justifyContent:'center', alignItems:'center' },
  playCtrl:{
    position:'absolute',
    alignSelf:'center',
    backgroundColor:COLORS.PURPLE,
    width:56,
    height:56,
    borderRadius:28,
    alignItems:'center',
    justifyContent:'center',
    zIndex:12,
  },
  playCtrlIcon:{ color:'#fff', fontSize:24, marginLeft:2 },
  pauseIcon:{ flexDirection:'row', gap:4 },
  pauseBar:{ width:4, height:20, backgroundColor:'#fff', borderRadius:2 },
  quizBtn: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 25,
    alignItems: 'center',
    zIndex: 5,
  },
  quizBtnTxt: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: COLORS.WHITE,
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
  bottomActionContainer: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  dot: { height: 10, borderRadius: 5, marginHorizontal: 5 },
  dotActive: { width: 25, backgroundColor: COLORS.PURPLE },
  dotInactive: { width: 10, backgroundColor: COLORS.GRAY_DOT },
});
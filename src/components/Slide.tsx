import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');

type BaseSlide = { topOffset?: number };

export type SlideType =
  | ({ type: 'intro'   ; title: string; body: string } & BaseSlide)
  | ({ type: 'preQuiz' ; title: string; body: string } & BaseSlide)
  | ({ type: 'content' ; title: string; body: string; image: any } & BaseSlide)
  | ({
      type: 'video';
      video: any;
      player?: any;
      onVideoEnd?: () => void;
      topOffset: number;
    } & BaseSlide);

export default function Slide(props: SlideType) {
  /* ------------ VÍDEO ------------ */
  if (props.type === 'video') {
    const videoEndHandledRef = useRef(false);
    const player = props.player;
    const videoHeight = height - 150; // fill screen minus controls and safe areas
    
    useEffect(() => {
      if (!player) return;

      const endSub = player.addListener('playToEnd', () => {
        if (!videoEndHandledRef.current) {
          try { player.pause(); } catch {}
          videoEndHandledRef.current = true;
          props.onVideoEnd?.();
        }
      });

      const playSub = player.addListener('playingChange', ({ isPlaying }: { isPlaying: boolean }) => {
        // When playback starts from beginning, clear end flag
        if (isPlaying && player.currentTime < 0.5) {
          videoEndHandledRef.current = false;
        }
      });

      return () => {
        endSub.remove();
        playSub.remove();
      };
    }, [player, props.onVideoEnd]);

    return (
      <View style={{ width: '100%', alignItems: 'center' }}>
        <VideoView
          player={player}
          style={{ width, height: videoHeight }}
          pointerEvents="none"
        />
      </View>
    );
  }

  /* ------------ INTRO con Amy ------------ */
  if (props.type === 'intro')
    return (
      <View style={styles.container}>
        <Image source={require('../../assets/images/amy/amy_idle.png')} style={styles.amy}/>
        <View style={styles.bubble}>
          <Text style={styles.title}>{props.title}</Text>
          <Text style={styles.body}>{props.body}</Text>
        </View>
      </View>
    );

  /* ------------ CONTENIDO / PREQUIZ ------------ */
  return (
    <View style={styles.container}>
      {'image' in props && (
        <Image source={props.image} style={styles.image} resizeMode="contain" />
      )}
      {'title' in props && <Text style={styles.title}>{props.title}</Text>}
      {'body' in props &&  <Text style={styles.body}>{props.body}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, alignItems:'center', justifyContent:'center', padding:24 },
  amy:{ width:width*0.4, height:width*0.4, marginBottom:20 },
  bubble:{ backgroundColor:'#F1F1F1', borderRadius:18, padding:20, maxWidth:'90%' },
  image:{ width:width*0.7, height:height*0.3, marginBottom:16 },
  title:{ fontFamily:'NunitoBold', fontSize:24, textAlign:'center', marginBottom:12 },
  body:{ fontFamily:'NunitoRegular', fontSize:16, textAlign:'center' },
});

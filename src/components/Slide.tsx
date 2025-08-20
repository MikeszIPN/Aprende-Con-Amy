import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

export type SlideType =
  | { type: 'intro'   ; title: string; body: string }
  | { type: 'preQuiz' ; title: string; body: string }
  | { type: 'content' ; title: string; body: string; image: any }
  | {
      type: 'video';
      video: any;
      play?: boolean;
      onVideoStart?: () => void;
      onVideoEnd?: () => void;
      topOffset: number;
    };

export default function Slide(props: SlideType) {
  /* ------------ VÍDEO ------------ */
  if (props.type === 'video') {
    const ref = useRef<Video>(null);

    /* reproduce / pausa según visibilidad */
    useEffect(() => {
      if (!ref.current) return;
      props.play ? ref.current.playAsync() : ref.current.pauseAsync();
    }, [props.play]);

    return (
      <View style={{ paddingTop: props.topOffset }}>
        <Video
          ref={ref}
          source={props.video}
          style={{ width, height: height - props.topOffset }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          useNativeControls={false}
          pointerEvents="none"
          onPlaybackStatusUpdate={(s) => {
            if (!s.isLoaded) return;
            if (s.isPlaying && s.positionMillis < 400)  props.onVideoStart?.();
            if (s.didJustFinish)                        props.onVideoEnd?.();
          }}
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

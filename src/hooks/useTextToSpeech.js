import { useState, useEffect, useRef } from 'react';
import Tts from 'react-native-tts';

export const useTextToSpeech = (sentences, markChapterAdRead) => {
  const [ttsStatus, setTtsStatus] = useState({});
  const ttsPosition = useRef(0);
  useEffect(() => {
    Tts.addEventListener('tts-finish', () => {
      if (ttsPosition == sentences.length - 1) {
        markChapterAdRead();
        setTtsStatus('finish');
      }
      ttsPosition.current = ttsPosition.current + 1;
    });
    return () => {
      Tts.removeAllListeners('tts-finish');
      Tts.stop();
    };
  }, []);

  const startTts = () => {
    if (ttsStatus === 'progress') {
      setTtsStatus('paused');
      Tts.stop();
      return;
    }

    setTtsStatus('progress');
    Tts.stop();
    for (let i = ttsPosition.current; i < sentences.length; i++) {
      Tts.speak(sentences[i], {
        androidParams: {
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
      });
    }
  };

  return [ttsStatus, startTts];
};

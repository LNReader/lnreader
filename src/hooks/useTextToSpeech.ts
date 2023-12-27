import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  RefObject,
} from 'react';
import WebView from 'react-native-webview';
import Tts from 'react-native-tts';
import { htmlToText } from '@plugins/helpers/htmlToText';

interface TextToSpeechData {
  currentIndex: number;
  sentences: string[];
}

export const useTextToSpeech = (
  chapterText: string,
  webViewRef: RefObject<WebView>,
  markChapterAsRead: () => void,
): [string, () => void] => {
  const [ttsStatus, setTtsStatus] = useState('');
  const data = useRef<TextToSpeechData>({
    currentIndex: 0,
    sentences: [],
  } as TextToSpeechData);
  data.current.sentences = useMemo(
    () =>
      htmlToText(chapterText)
        .replace(/<t-t-s>/g, '')
        .split('</t-t-s>'),
    [chapterText],
  );
  const play = useCallback(() => {
    if (data.current.currentIndex < data.current.sentences.length) {
      Tts.speak(data.current.sentences[data.current.currentIndex], {
        iosVoiceId: '',
        rate: 0.5,
        androidParams: {
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
          KEY_PARAM_VOLUME: 1,
          KEY_PARAM_PAN: 0,
        },
      });
    } else {
      markChapterAsRead();
      setTtsStatus('finished');
      Tts.stop();
    }
  }, []);

  useEffect(() => {
    return () => {
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-start');
      Tts.stop();
    };
  }, []);

  const startTts = useCallback(() => {
    if (ttsStatus === 'progress') {
      setTtsStatus('paused');
      data.current.currentIndex -= 1;
      Tts.stop();
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-start');
      return;
    }
    Tts.addEventListener('tts-finish', () => play());
    Tts.addEventListener('tts-start', () => {
      webViewRef.current?.injectJavaScript(
        `tts.play(${data.current.currentIndex})`,
      );
      data.current.currentIndex += 1;
    });
    setTtsStatus('progress');
    play();
  }, [ttsStatus]);

  return [ttsStatus, startTts];
};

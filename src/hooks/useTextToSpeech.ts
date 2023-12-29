import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  RefObject,
} from 'react';
import WebView from 'react-native-webview';
import * as Speech from 'expo-speech';
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
      Speech.speak(data.current.sentences[data.current.currentIndex], {
        rate: 0.5,
        onStart() {
          webViewRef.current?.injectJavaScript(
            `tts.play(${data.current.currentIndex})`,
          );
          data.current.currentIndex += 1;
        },
        onStopped() {
          play();
        },
      });
    } else {
      markChapterAsRead();
      setTtsStatus('finished');
      Speech.stop();
    }
  }, []);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const startTts = useCallback(() => {
    if (ttsStatus === 'progress') {
      setTtsStatus('paused');
      data.current.currentIndex -= 1;
      Speech.stop();
      return;
    }
    setTtsStatus('progress');
    play();
  }, [ttsStatus]);

  return [ttsStatus, startTts];
};

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

export const enum TextToSpeechStatus {
  PAUSED,
  PROGRESS,
}

export const useTextToSpeech = (
  chapterText: string,
  webViewRef: RefObject<WebView>,
  markChapterAsRead: () => void,
): [TextToSpeechStatus, () => void] => {
  const [ttsStatus, setTtsStatus] = useState(TextToSpeechStatus.PAUSED);
  const index = useRef<number>(0);
  const sentences: string[] = useMemo(
    () =>
      htmlToText(chapterText)
        .replace(/<t-t-s>/g, '')
        .split('</t-t-s>'),
    [chapterText],
  );

  const play = useCallback(() => {
    Speech.speak(sentences[index.current], {
      onStart() {
        webViewRef.current?.injectJavaScript(`tts.play(${index.current})`);
      },
      onDone() {
        if (index.current === sentences.length) {
          index.current = 0;
          setTtsStatus(TextToSpeechStatus.PAUSED);
          markChapterAsRead();
        } else {
          index.current = index.current + 1;
          play();
        }
      },
    });
  }, [sentences]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const startTts = () => {
    if (ttsStatus === TextToSpeechStatus.PROGRESS) {
      setTtsStatus(TextToSpeechStatus.PAUSED);
      Speech.stop();
    } else {
      setTtsStatus(TextToSpeechStatus.PROGRESS);
      play();
    }
  };

  return [ttsStatus, startTts];
};

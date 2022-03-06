import { useState, useEffect } from 'react';
import Tts from 'react-native-tts';
import { htmlToText } from '../sources/helpers/htmlToText';

export const useTextToSpeech = html => {
  const [ttsStatus, setTtsStatus] = useState();
  const [ttsPosition, setTtsPosition] = useState({ end: 0 });

  let text = htmlToText(html);

  useEffect(() => {
    Tts.addEventListener('tts-start', () => setTtsStatus('start'));
    Tts.addEventListener('tts-progress', event => {
      setTtsStatus('progress');
      setTtsPosition(event);
    });
    Tts.addEventListener('tts-finish', () => setTtsStatus('finish'));
    Tts.addEventListener('tts-cancel', () => setTtsStatus('paused'));

    return () => Tts.stop();
  }, []);

  const startTts = () => {
    if (ttsStatus === 'progress') {
      setTtsPosition({ end: 0 });
      setTtsStatus('finish');
      Tts.stop();
      return;
    }

    if (text.length >= 3999) {
      const splitNChars = (txt, num) => {
        let result = [];
        for (let i = 0; i < txt.length; i += num) {
          result.push(txt.substr(i, num));
        }
        return result;
      };

      let splitMe = splitNChars(text, 3999);

      splitMe.forEach(value => {
        Tts.speak(value, {
          androidParams: {
            KEY_PARAM_STREAM: 'STREAM_MUSIC',
          },
        });
      });
    } else {
      Tts.stop();
      Tts.speak(text, {
        androidParams: {
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
      });
    }
  };

  const pauseTts = () => {
    if (ttsStatus === 'progress') {
      setTtsStatus('paused');
      Tts.stop();
      return;
    } else {
      text = text.slice(ttsPosition.end);

      if (text.length >= 3999) {
        const splitNChars = (txt, num) => {
          let result = [];
          for (let i = 0; i < txt.length; i += num) {
            result.push(txt.substr(i, num));
          }
          return result;
        };

        let splitMe = splitNChars(text, 3999);

        splitMe.forEach(value => {
          Tts.speak(value, {
            androidParams: {
              KEY_PARAM_STREAM: 'STREAM_MUSIC',
            },
          });
        });
      } else {
        Tts.stop();
        Tts.speak(text, {
          androidParams: {
            KEY_PARAM_STREAM: 'STREAM_MUSIC',
          },
        });
      }
    }
  };

  return [ttsStatus, ttsPosition, startTts, pauseTts];
};

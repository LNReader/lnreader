import {
  getChapter as getDbChapter,
  getNextChapter,
  getPrevChapter,
  markChapterRead,
  updateChapterProgress,
} from '@database/queries/ChapterQueries';
import { insertHistory } from '@database/queries/HistoryQueries';
import { ChapterInfo } from '@database/types';
import {
  useChapterGeneralSettings,
  useLibrarySettings,
  useNovel,
  useTrackedNovel,
  useTracker,
} from '@hooks/persisted';
import { fetchChapter } from '@services/plugin/fetch';
import { NOVEL_STORAGE } from '@utils/Storages';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { sanitizeChapterText } from '../utils/sanitizeChapterText';
import { parseChapterNumber } from '@utils/parseChapterNumber';
import WebView from 'react-native-webview';
import { useFullscreenMode } from '@hooks';
import { Dimensions, NativeEventEmitter } from 'react-native';
import * as Speech from 'expo-speech';
import { defaultTo } from 'lodash-es';
import { useChapterContext } from '../ChapterContext';
import { showToast } from '@utils/showToast';
import { getString } from '@strings/translations';
import NativeVolumeButtonListener from '@specs/NativeVolumeButtonListener';
import NativeFile from '@specs/NativeFile';

const emmiter = new NativeEventEmitter(NativeVolumeButtonListener);

export default function useChapter(webViewRef: RefObject<WebView>) {
  const { novel, chapter, setChapter, loading, setLoading } =
    useChapterContext();
  const { setLastRead } = useNovel(novel.path, novel.pluginId);
  const [hidden, setHidden] = useState(true);
  const [chapterText, setChapterText] = useState('');
  const [[nextChapter, prevChapter], setAdjacentChapter] = useState<
    ChapterInfo[]
  >([]);
  const { autoScroll, autoScrollInterval, autoScrollOffset, useVolumeButtons } =
    useChapterGeneralSettings();
  const { incognitoMode } = useLibrarySettings();
  const [error, setError] = useState<string>();
  const { tracker } = useTracker();
  const { trackedNovel, updateNovelProgess } = useTrackedNovel(novel.id);
  const { setImmersiveMode, showStatusAndNavBar } = useFullscreenMode();

  const connectVolumeButton = useCallback(() => {
    emmiter.addListener('VolumeUp', () => {
      webViewRef.current?.injectJavaScript(`(()=>{
          window.scrollBy({top: -${
            Dimensions.get('window').height * 0.75
          }, behavior: 'smooth'})
        })()`);
    });
    emmiter.addListener('VolumeDown', () => {
      webViewRef.current?.injectJavaScript(`(()=>{
          window.scrollBy({top: ${
            Dimensions.get('window').height * 0.75
          }, behavior: 'smooth'})
        })()`);
    });
  }, [webViewRef]);

  useEffect(() => {
    if (useVolumeButtons) {
      connectVolumeButton();
    } else {
      emmiter.removeAllListeners('VolumeUp');
      emmiter.removeAllListeners('VolumeDown');
      // this is just for sure, without it app still works properly
    }

    return () => {
      emmiter.removeAllListeners('VolumeUp');
      emmiter.removeAllListeners('VolumeDown');
      Speech.stop();
    };
  }, [useVolumeButtons, chapter, connectVolumeButton]);

  const getChapter = useCallback(async () => {
    try {
      const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${chapter.novelId}/${chapter.id}/index.html`;
      let text = '';
      if (NativeFile.exists(filePath)) {
        text = NativeFile.readFile(filePath);
      } else {
        await fetchChapter(novel.pluginId, chapter.path)
          .then(res => {
            text = res;
          })
          .catch(e => setError(e.message));
      }
      setChapterText(
        sanitizeChapterText(novel.pluginId, novel.name, chapter.name, text),
      );

      const [nextChap, prevChap] = await Promise.all([
        getNextChapter(chapter.novelId, chapter.position!, chapter.page),
        getPrevChapter(chapter.novelId, chapter.position!, chapter.page),
      ]);
      setAdjacentChapter([nextChap!, prevChap!]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [
    chapter.id,
    chapter.name,
    chapter.novelId,
    chapter.page,
    chapter.path,
    chapter.position,
    novel.name,
    novel.pluginId,
    setLoading,
  ]);

  const scrollInterval = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (autoScroll) {
      scrollInterval.current = setInterval(() => {
        webViewRef.current?.injectJavaScript(`(()=>{
          window.scrollBy({top:${defaultTo(
            autoScrollOffset,
            Dimensions.get('window').height,
          )},behavior:'smooth'})
        })()`);
      }, autoScrollInterval * 1000);
    } else {
      clearInterval(scrollInterval.current);
    }

    return () => clearInterval(scrollInterval.current);
  }, [autoScroll, autoScrollInterval, autoScrollOffset, webViewRef]);

  const updateTracker = useCallback(() => {
    const chapterNumber = parseChapterNumber(novel.name, chapter.name);
    if (tracker && trackedNovel && chapterNumber > trackedNovel.progress) {
      updateNovelProgess(tracker, chapterNumber);
    }
  }, [chapter.name, novel.name, trackedNovel, tracker, updateNovelProgess]);

  const saveProgress = useCallback(
    (percentage: number) => {
      if (!incognitoMode) {
        updateChapterProgress(chapter.id, percentage > 100 ? 100 : percentage);
      }

      if (!incognitoMode && percentage >= 97) {
        // a relative number
        markChapterRead(chapter.id);
        updateTracker();
      }
    },
    [chapter.id, incognitoMode, updateTracker],
  );

  const hideHeader = () => {
    if (!hidden) {
      webViewRef.current?.injectJavaScript('reader.hidden.val = true');
      setImmersiveMode();
    } else {
      webViewRef.current?.injectJavaScript('reader.hidden.val = false');
      showStatusAndNavBar();
    }
    setHidden(!hidden);
  };

  const navigateChapter = useCallback(
    (position: 'NEXT' | 'PREV') => {
      let navChapter;
      if (position === 'NEXT') {
        navChapter = nextChapter;
      } else if (position === 'PREV') {
        navChapter = prevChapter;
      } else {
        return;
      }

      if (navChapter) {
        setLoading(true);
        setChapter(navChapter);
      } else {
        showToast(
          position === 'NEXT'
            ? getString('readerScreen.noNextChapter')
            : getString('readerScreen.noPreviousChapter'),
        );
      }
    },
    [nextChapter, prevChapter, setChapter, setLoading],
  );

  useEffect(() => {
    setLoading(true);
    getChapter().finally(() => setLoading(false));

    if (!incognitoMode) {
      insertHistory(chapter.id);
      getDbChapter(chapter.id).then(result => result && setLastRead(result));
    }

    return () => {
      if (!incognitoMode) {
        getDbChapter(chapter.id).then(result => result && setLastRead(result));
      }
    };
  }, [chapter, getChapter, incognitoMode, setLastRead, setLoading]);

  const refetch = () => {
    setLoading(true);
    setError('');
    getChapter().finally(() => setLoading(false));
  };

  return {
    hidden,
    chapter,
    nextChapter,
    prevChapter,
    error,
    loading,
    chapterText,
    setHidden,
    saveProgress,
    hideHeader,
    navigateChapter,
    refetch,
  };
}

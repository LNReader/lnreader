import {
  getChapter as getDbChapter,
  getNextChapter,
  getPrevChapter,
} from '@database/queries/ChapterQueries';
import { insertHistory } from '@database/queries/HistoryQueries';
import { ChapterInfo, NovelInfo } from '@database/types';
import {
  useChapterGeneralSettings,
  useLibrarySettings,
  useTrackedNovel,
  useTracker,
} from '@hooks/persisted';
import { fetchChapter } from '@services/plugin/fetch';
import { NOVEL_STORAGE } from '@utils/Storages';
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { sanitizeChapterText } from '../utils/sanitizeChapterText';
import { parseChapterNumber } from '@utils/parseChapterNumber';
import WebView from 'react-native-webview';
import { useFullscreenMode } from '@hooks';
import { Dimensions, NativeEventEmitter } from 'react-native';
import * as Speech from 'expo-speech';
import { defaultTo } from 'lodash-es';
import { showToast } from '@utils/showToast';
import { getString } from '@strings/translations';
import NativeVolumeButtonListener from '@specs/NativeVolumeButtonListener';
import NativeFile from '@specs/NativeFile';
import { useNovelContext } from '@screens/novel/NovelContext';

const emmiter = new NativeEventEmitter(NativeVolumeButtonListener);

export default function useChapter(
  webViewRef: RefObject<WebView | null>,
  initialChapter: ChapterInfo,
  novel: NovelInfo,
) {
  const {
    setLastRead,
    markChapterRead,
    updateChapterProgress,
    chapterTextCache,
  } = useNovelContext();
  const [hidden, setHidden] = useState(true);
  const [chapter, setChapter] = useState(initialChapter);
  const [loading, setLoading] = useState(true);
  const [chapterText, setChapterText] = useState('');

  const [[nextChapter, prevChapter], setAdjacentChapter] = useState<
    ChapterInfo[] | undefined[]
  >([]);
  const { autoScroll, autoScrollInterval, autoScrollOffset, useVolumeButtons } =
    useChapterGeneralSettings();
  const { incognitoMode } = useLibrarySettings();
  const [error, setError] = useState<string>();
  const { tracker } = useTracker();
  const { trackedNovel, updateNovelProgess } = useTrackedNovel(novel.id);
  const { setImmersiveMode, showStatusAndNavBar } = useFullscreenMode();

  // Shared scroll functions (used by both volume buttons and S Pen)
  const scroll = useCallback((direction: 'up' | 'down') => {
    const multiplier = direction === 'up' ? -0.75 : 0.75;
    webViewRef.current?.injectJavaScript(`(()=>{
        window.scrollBy({top: ${
          Dimensions.get('window').height * multiplier
        }, behavior: 'smooth'})
      })()`);
  }, [webViewRef]);

  const scrollUp = () => scroll('up');
  const scrollDown = () => scroll('down');

  // Volume button event listeners
  useEffect(() => {
    if (useVolumeButtons) {
      emmiter.addListener('VolumeUp', scrollUp);
      emmiter.addListener('VolumeDown', scrollDown);
    }

    return () => {
      emmiter.removeAllListeners('VolumeUp');
      emmiter.removeAllListeners('VolumeDown');
      Speech.stop();
    };
  }, [useVolumeButtons, chapter, scroll]);

  const loadChapterText = useCallback(
    async (id: number, path: string) => {
      const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${chapter.novelId}/${id}/index.html`;
      let text = '';
      if (NativeFile.exists(filePath)) {
        text = NativeFile.readFile(filePath);
      } else {
        await fetchChapter(novel.pluginId, path)
          .then(res => {
            text = res;
          })
          .catch(e => setError(e.message));
      }
      return text;
    },
    [chapter.novelId, novel.pluginId],
  );

  const getChapter = useCallback(
    async (navChapter?: ChapterInfo) => {
      try {
        const chap = navChapter ?? chapter;
        const cachedText = chapterTextCache.get(chap.id);
        const text = cachedText ?? loadChapterText(chap.id, chap.path);
        const [nextChap, prevChap, awaitedText] = await Promise.all([
          getNextChapter(chap.novelId, chap.position!, chap.page),
          getPrevChapter(chap.novelId, chap.position!, chap.page),
          text,
        ]);
        if (nextChap && !chapterTextCache.get(nextChap.id)) {
          chapterTextCache.set(
            nextChap.id,
            loadChapterText(nextChap.id, nextChap.path),
          );
        }
        if (!cachedText) {
          chapterTextCache.set(chap.id, text);
        }
        setChapter(chap);
        setChapterText(
          sanitizeChapterText(
            novel.pluginId,
            novel.name,
            chap.name,
            awaitedText,
          ),
        );
        setAdjacentChapter([nextChap!, prevChap!]);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [
      chapter,
      chapterTextCache,
      loadChapterText,
      setChapter,
      setChapterText,
      novel.pluginId,
      novel.name,
      setLoading,
    ],
  );

  const scrollInterval = useRef<NodeJS.Timeout>(null);
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
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
      }
    }

    return () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
      }
    };
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

        if (percentage >= 97) {
          // a relative number
          markChapterRead(chapter.id);
          updateTracker();
        }
      }
    },
    [
      chapter.id,
      incognitoMode,
      markChapterRead,
      updateChapterProgress,
      updateTracker,
    ],
  );

  const hideHeader = useCallback(() => {
    if (!hidden) {
      webViewRef.current?.injectJavaScript('reader.hidden.val = true');
      setImmersiveMode();
    } else {
      webViewRef.current?.injectJavaScript('reader.hidden.val = false');
      showStatusAndNavBar();
    }
    setHidden(!hidden);
  }, [hidden, setImmersiveMode, showStatusAndNavBar, webViewRef]);

  const navigateChapter = useCallback(
    (position: 'NEXT' | 'PREV') => {
      let nextNavChapter;
      if (position === 'NEXT') {
        nextNavChapter = nextChapter;
      } else if (position === 'PREV') {
        nextNavChapter = prevChapter;
      } else {
        return;
      }
      if (nextNavChapter) {
        // setLoading(true);

        getChapter(nextNavChapter);
      } else {
        showToast(
          position === 'NEXT'
            ? getString('readerScreen.noNextChapter')
            : getString('readerScreen.noPreviousChapter'),
        );
      }
    },
    [getChapter, nextChapter, prevChapter],
  );

  useEffect(() => {
    if (!incognitoMode) {
      insertHistory(chapter.id);
      getDbChapter(chapter.id).then(result => result && setLastRead(result));
    }

    return () => {
      if (!incognitoMode) {
        getDbChapter(chapter.id).then(result => result && setLastRead(result));
      }
    };
  }, [incognitoMode, setLastRead, setLoading, chapter.id]);

  useEffect(() => {
    if (!chapter || !chapterText) {
      getChapter();
    }
  }, [chapter, chapterText, getChapter]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError('');
    getChapter();
  }, [getChapter]);

  return useMemo(
    () => ({
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
      setChapter,
      setLoading,
      getChapter,
      scrollUp,
      scrollDown,
    }),
    [
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
      setChapter,
      setLoading,
      getChapter,
      scrollUp,
      scrollDown,
    ],
  );
}

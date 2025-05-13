import {
  getChapter as getDbChapter,
  getNextChapter,
  getPrevChapter,
} from '@database/queries/ChapterQueries';
import { insertHistory } from '@database/queries/HistoryQueries';
import { ChapterInfo } from '@database/types';
import {
  useChapterGeneralSettings,
  useLibrarySettings,
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
import { useNovelContext } from '@screens/novel/NovelContext';

const emmiter = new NativeEventEmitter(NativeVolumeButtonListener);

export default function useChapter(webViewRef: RefObject<WebView | null>) {
  const {
    novel,
    chapter,
    setChapter,
    loading,
    setLoading,
    chapterText,
    setChapterText,
  } = useChapterContext();
  const { setLastRead, markChapterRead, updateChapterProgress } =
    useNovelContext();
  const [hidden, setHidden] = useState(true);
  const nextChapterTextRef = useRef<string | Promise<string> | undefined>(
    undefined,
  );
  const [[nextChapter, prevChapter], setAdjacentChapter] = useState<
    ChapterInfo[] | undefined[]
  >([]);
  const [navChapter, setNavChapter] = useState<ChapterInfo>();
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
    async (nextChapterId?: number) => {
      try {
        let text;
        const chap = navChapter ?? chapter;
        if (nextChapterId === chap.id && nextChapterTextRef.current) {
          text = await nextChapterTextRef.current;
        } else {
          text = await loadChapterText(chap.id, chap.path);
        }
        setChapterText(
          sanitizeChapterText(novel.pluginId, novel.name, chap.name, text),
        );

        const [nextChap, prevChap] = await Promise.all([
          getNextChapter(chap.novelId, chap.position!, chap.page),
          getPrevChapter(chap.novelId, chap.position!, chap.page),
        ]);
        if (nextChap) {
          nextChapterTextRef.current = loadChapterText(
            nextChap.id,
            nextChap.path,
          );
        }
        setChapter(chap);
        setAdjacentChapter([nextChap!, prevChap!]);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [
      navChapter,
      chapter,
      novel.pluginId,
      novel.name,
      setChapter,
      loadChapterText,
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
        if (!nextChapterTextRef.current || position === 'PREV') {
          setLoading(true);
        }

        setNavChapter(nextNavChapter);
      } else {
        showToast(
          position === 'NEXT'
            ? getString('readerScreen.noNextChapter')
            : getString('readerScreen.noPreviousChapter'),
        );
      }
    },
    [nextChapter, prevChapter, setLoading],
  );

  useEffect(() => {
    // setLoading(true);
    getChapter(nextChapter?.id);

    if (!incognitoMode) {
      insertHistory(chapter.id);
      getDbChapter(chapter.id).then(result => result && setLastRead(result));
    }

    return () => {
      if (!incognitoMode) {
        getDbChapter(chapter.id).then(result => result && setLastRead(result));
      }
    };
    // eslint wants to add nextChapter.id as a dependency which will cause a rerender
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navChapter, getChapter, incognitoMode, setLastRead, setLoading]);

  const refetch = () => {
    setLoading(true);
    setError('');
    getChapter();
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

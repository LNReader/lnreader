import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  Dimensions,
  NativeEventEmitter,
  DrawerLayoutAndroid,
} from 'react-native';
import * as RNFS from 'react-native-fs';

import VolumeButtonListener from '@native/volumeButtonListener';

import { useDispatch } from 'react-redux';
import { useKeepAwake } from 'expo-keep-awake';

import {
  getNextChapter,
  getPrevChapter,
} from '../../database/queries/ChapterQueries';
import { fetchChapter } from '@services/plugin/fetch';
import { showToast } from '@hooks/showToast';
import { usePosition, useSettings, useTrackingStatus } from '@hooks/reduxHooks';
import { useTheme } from '@hooks/useTheme';
import { updateChaptersRead } from '@redux/tracker/tracker.actions';
import { markChapterReadAction } from '@redux/novel/novel.actions';
import { saveScrollPosition } from '@redux/preferences/preferencesSlice';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import ReaderAppbar from './components/ReaderAppbar';
import ReaderFooter from './components/ReaderFooter';

import { insertHistory } from '@database/queries/HistoryQueries';
import { setLastReadAction } from '@redux/preferences/preferencesSlice';
import WebViewReader from './components/WebViewReader';
import { useTextToSpeech } from '@hooks/useTextToSpeech';
import { useFullscreenMode, useLibrarySettings } from '@hooks';
import ReaderBottomSheetV2 from './components/ReaderBottomSheet/ReaderBottomSheet';
import { defaultTo } from 'lodash-es';
import BottomInfoBar from './components/BottomInfoBar/BottomInfoBar';
import { sanitizeChapterText } from './utils/sanitizeChapterText';
import ChapterDrawer from './components/ChapterDrawer';
import ChapterLoadingScreen from './ChapterLoadingScreen/ChapterLoadingScreen';
import { ErrorScreenV2 } from '@components';
import { ChapterScreenProps } from '@navigators/types';
import { ChapterInfo } from '@database/types';
import WebView, { WebViewNavigation } from 'react-native-webview';
import { NovelDownloadFolder } from '@utils/constants/download';

const Chapter = ({ route, navigation }: ChapterScreenProps) => {
  const drawerRef = useRef<DrawerLayoutAndroid>(null);
  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={300}
      drawerPosition="left"
      renderNavigationView={() => (
        <ChapterDrawer route={route} navigation={navigation} />
      )}
    >
      <ChapterContent
        route={route}
        navigation={navigation}
        drawerRef={drawerRef}
      />
    </DrawerLayoutAndroid>
  );
};

type ChapterContentProps = ChapterScreenProps & {
  drawerRef: React.RefObject<DrawerLayoutAndroid>;
};

export const ChapterContent = ({
  route,
  navigation,
  drawerRef,
}: ChapterContentProps) => {
  useKeepAwake();
  const params = route.params;
  const { novel, chapter } = params;
  const webViewRef = useRef<WebView>(null);
  const readerSheetRef = useRef(null);

  const theme = useTheme();
  const dispatch = useDispatch();

  const {
    swipeGestures = false,
    useVolumeButtons = false,
    autoScroll = false,
    autoScrollInterval = 10,
    autoScrollOffset = null,
    // verticalSeekbar = true,
    removeExtraParagraphSpacing = false,
  } = useSettings();
  const { incognitoMode } = useLibrarySettings();

  const { setImmersiveMode, showStatusAndNavBar } = useFullscreenMode();

  const [hidden, setHidden] = useState(true);
  const position = usePosition(chapter.novelId, chapter.id);

  const { tracker, trackedNovels } = useTrackingStatus();
  const isTracked = trackedNovels.find(
    (obj: any) => obj.novel.id === chapter.novelId,
  );

  const [sourceChapter, setChapter] = useState({ ...chapter, chapterText: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [[nextChapter, prevChapter], setAdjacentChapter] = useState<
    ChapterInfo[]
  >([]);

  const emmiter = useRef(new NativeEventEmitter(VolumeButtonListener));

  const connectVolumeButton = () => {
    VolumeButtonListener.connect();
    VolumeButtonListener.preventDefault();
    emmiter.current.addListener('VolumeUp', () => {
      webViewRef.current?.injectJavaScript(`(()=>{
          window.scrollBy({top:${-Dimensions.get('window')
            .height},behavior:'smooth',})
        })()`);
    });
    emmiter.current.addListener('VolumeDown', () => {
      webViewRef.current?.injectJavaScript(`(()=>{
          window.scrollBy({top:${
            Dimensions.get('window').height
          },behavior:'smooth',})
        })()`);
    });
  };

  useEffect(() => {
    if (useVolumeButtons) {
      connectVolumeButton();
    } else {
      VolumeButtonListener.disconnect();
      emmiter.current.removeAllListeners('VolumeUp');
      emmiter.current.removeAllListeners('VolumeDown');
      // this is just for sure, without it app still works properly
    }
    return () => {
      VolumeButtonListener.disconnect();
      emmiter.current.removeAllListeners('VolumeUp');
      emmiter.current.removeAllListeners('VolumeDown');
    };
  }, [useVolumeButtons, chapter]);

  const onLayout = useCallback(() => {
    setTimeout(() => connectVolumeButton());
  }, []);

  const getChapter = async () => {
    try {
      const filePath = `${NovelDownloadFolder}/${novel.pluginId}/${chapter.novelId}/${chapter.id}/index.html`;
      if (await RNFS.exists(filePath)) {
        sourceChapter.chapterText = await RNFS.readFile(filePath);
      } else {
        sourceChapter.chapterText = await fetchChapter(
          novel.pluginId,
          chapter.url,
        );
      }
      const [nextChap, prevChap] = await Promise.all([
        getNextChapter(chapter.novelId, chapter.id),
        getPrevChapter(chapter.novelId, chapter.id),
      ]);
      setChapter(sourceChapter);
      setAdjacentChapter([nextChap, prevChap]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getChapter();
    if (!incognitoMode) {
      insertHistory(chapter.id);
      dispatch(setLastReadAction(chapter));
    }
  }, []);

  const scrollTo = useCallback(
    (offsetY: number) => {
      webViewRef.current?.injectJavaScript(`(()=>{
        window.scrollTo({top:${offsetY},behavior:'smooth',})
      })()`);
    },
    [webViewRef],
  );

  let scrollInterval: NodeJS.Timer;
  useEffect(() => {
    if (autoScroll) {
      scrollInterval = setInterval(() => {
        webViewRef.current?.injectJavaScript(`(()=>{
          window.scrollBy({top:${defaultTo(
            autoScrollOffset,
            Dimensions.get('window').height,
          )},behavior:'smooth'})
        })()`);
      }, autoScrollInterval * 1000);
    } else {
      clearInterval(scrollInterval);
    }

    return () => clearInterval(scrollInterval);
  }, [autoScroll, webViewRef]);

  const updateTracker = () => {
    const chapterNumber = parseChapterNumber(novel.name, chapter.name);

    isTracked &&
      chapterNumber &&
      Number.isInteger(chapterNumber) &&
      chapterNumber > isTracked.my_list_status.num_chapters_read &&
      dispatch(
        updateChaptersRead(isTracked.id, tracker.access_token, chapterNumber),
      );
  };

  const saveProgress = useCallback(
    async (offsetY: number, percentage: number) => {
      if (!incognitoMode) {
        dispatch(
          saveScrollPosition({
            offsetY,
            percentage,
            chapterId: chapter.id,
            novelId: chapter.novelId,
          }),
        );
      }

      if (!incognitoMode && percentage >= 97) {
        // a relative number
        dispatch(markChapterReadAction(chapter.id, chapter.novelId));
        updateTracker();
      }
    },
    [chapter],
  );

  const hideHeader = () => {
    if (!hidden) {
      webViewRef.current?.injectJavaScript('scrollHandler.hide()');
      setImmersiveMode();
    } else {
      webViewRef.current?.injectJavaScript('scrollHandler.show()');
      showStatusAndNavBar();
    }
    setHidden(!hidden);
  };

  const navigateToChapterBySwipe = (actionName: string) => {
    let navChapter;
    if (actionName === 'SWIPE_LEFT') {
      navChapter = nextChapter;
    } else if (actionName === 'SWIPE_RIGHT') {
      navChapter = prevChapter;
    } else {
      return;
    }

    navChapter
      ? navigation.replace('Chapter', {
          novel: novel,
          chapter: navChapter,
        })
      : showToast(
          actionName === 'SWIPE_LEFT'
            ? "There's no next chapter"
            : "There's no previous chapter",
        );
  };

  const onWebViewNavigationStateChange = async ({ url }: WebViewNavigation) => {
    if (url !== 'about:blank') {
      setLoading(true);
      const res = await fetchChapter(novel.pluginId, chapter.url);
      sourceChapter.chapterText = res;
      setChapter(sourceChapter);
      setLoading(false);
    }
  };

  const chapterText = useMemo(
    () =>
      sanitizeChapterText(sourceChapter.chapterText, {
        removeExtraParagraphSpacing,
      }),
    [sourceChapter.chapterText],
  );

  const [ttsStatus, startTts] = useTextToSpeech(chapterText, webViewRef, () => {
    if (!incognitoMode) {
      dispatch(markChapterReadAction(chapter.id, chapter.novelId));
      updateTracker();
    }
  });

  const openDrawer = useCallback(() => {
    drawerRef.current?.openDrawer();
    setHidden(true);
  }, [drawerRef]);

  if (loading) {
    return <ChapterLoadingScreen />;
  }

  if (error) {
    return <ErrorScreenV2 error={error} />;
  }

  return (
    <>
      <WebViewReader
        data={{ novel, chapter }}
        html={chapterText}
        swipeGestures={swipeGestures}
        nextChapter={nextChapter}
        webViewRef={webViewRef}
        saveProgress={saveProgress}
        onLayout={() => {
          useVolumeButtons && onLayout();
          scrollTo(position?.offsetY || 0);
        }}
        onPress={hideHeader}
        navigateToChapterBySwipe={navigateToChapterBySwipe}
        onWebViewNavigationStateChange={onWebViewNavigationStateChange}
      />
      <BottomInfoBar />
      <ReaderBottomSheetV2 bottomSheetRef={readerSheetRef} />
      {!hidden && (
        <>
          <ReaderAppbar
            bookmark={chapter.bookmark}
            novelName={novel.name}
            chapterId={chapter.id}
            chapterName={chapter.name}
            tts={startTts}
            textToSpeech={ttsStatus}
            theme={theme}
          />
          <ReaderFooter
            theme={theme}
            chapterUrl={chapter.url}
            nextChapter={nextChapter}
            prevChapter={prevChapter}
            readerSheetRef={readerSheetRef}
            scrollTo={scrollTo}
            navigateToChapterBySwipe={navigateToChapterBySwipe}
            openDrawer={openDrawer}
          />
        </>
      )}
    </>
  );
};

export default Chapter;

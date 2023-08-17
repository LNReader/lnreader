import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dimensions,
  NativeModules,
  NativeEventEmitter,
  DrawerLayoutAndroid,
} from 'react-native';

import VolumeButtonListener from '@utils/volumeButtonListener';

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
import { saveScrollPosition } from '@redux/preferences/preference.actions';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import ReaderAppbar from './components/ReaderAppbar';
import ReaderFooter from './components/ReaderFooter';
import ReaderSeekBar from './components/ReaderSeekBar';

import { insertHistory } from '@database/queries/HistoryQueries';
import { SET_LAST_READ } from '@redux/preferences/preference.types';
import WebViewReader from './components/WebViewReader';
import { useTextToSpeech } from '@hooks/useTextToSpeech';
import { useFullscreenMode, useLibrarySettings } from '@hooks';
import { getChapterFromDB } from '@database/queries/ChapterQueries';
import ReaderBottomSheetV2 from './components/ReaderBottomSheet/ReaderBottomSheet';
import { defaultTo } from 'lodash-es';
import BottomInfoBar from './components/BottomInfoBar/BottomInfoBar';
import { sanitizeChapterText } from './utils/sanitizeChapterText';
import ChapterDrawer from './components/ChapterDrawer';
import { htmlToText } from '@plugins/helpers/htmlToText';
import ChapterLoadingScreen from './ChapterLoadingScreen/ChapterLoadingScreen';
import { ErrorScreenV2 } from '@components';
import { ChapterScreenProps } from '@navigators/types';
import { ChapterInfo } from '@database/types';
import WebView, { WebViewNavigation } from 'react-native-webview';

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
    verticalSeekbar = true,
    removeExtraParagraphSpacing = false,
  } = useSettings();
  const { incognitoMode } = useLibrarySettings();

  const { setImmersiveMode, showStatusAndNavBar } = useFullscreenMode();

  const [hidden, setHidden] = useState(true);
  const position = usePosition(chapter.novelId, chapter.id);
  const minScroll = useRef<number>(0);

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

  const emmiter = useRef(
    new NativeEventEmitter(NativeModules.VolumeButtonListener),
  );

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
      const [chapterText, nextChap, prevChap] = await Promise.all([
        getChapterFromDB(chapter.id),
        getNextChapter(chapter.novelId, chapter.id),
        getPrevChapter(chapter.novelId, chapter.id),
      ]);
      if (chapterText) {
        sourceChapter.chapterText = chapterText;
      } else {
        sourceChapter.chapterText = await fetchChapter(
          novel.pluginId,
          chapter.url,
        );
      }
      setChapter(sourceChapter);
      setAdjacentChapter([nextChap, prevChap]);
    } catch (e: any) {
      setError(e.message);
      showToast(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getChapter();
    if (!incognitoMode) {
      insertHistory(chapter.id);
      dispatch({
        type: SET_LAST_READ,
        payload: { lastRead: chapter },
      });
    }
  }, []);

  const [ttsStatus, startTts] = useTextToSpeech(
    htmlToText(sourceChapter.chapterText).split('\n'),
    () => {
      if (!incognitoMode) {
        dispatch(markChapterReadAction(chapter.id, chapter.novelId));
        updateTracker();
      }
    },
  );

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

  const doSaveProgress = useCallback(
    async (offsetY: number, percentage: number) => {
      if (!incognitoMode) {
        dispatch(
          saveScrollPosition(offsetY, percentage, chapter.id, chapter.novelId),
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
      setImmersiveMode();
    } else {
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

  const chapterText = sanitizeChapterText(sourceChapter.chapterText, {
    removeExtraParagraphSpacing,
    pluginId: novel.pluginId,
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
        chapterName={chapter.name}
        swipeGestures={swipeGestures}
        minScroll={minScroll}
        nextChapter={nextChapter}
        webViewRef={webViewRef}
        onLayout={() => {
          useVolumeButtons && onLayout();
          scrollTo(position?.offsetY || 1);
        }}
        onPress={hideHeader}
        doSaveProgress={doSaveProgress}
        navigateToChapterBySwipe={navigateToChapterBySwipe}
        onWebViewNavigationStateChange={onWebViewNavigationStateChange}
      />
      <BottomInfoBar
        scrollPercentage={position?.percentage || Math.round(minScroll.current)}
      />
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
          <ReaderSeekBar
            theme={theme}
            minScroll={minScroll.current}
            verticalSeekbar={verticalSeekbar}
            percentage={position?.percentage}
            scrollTo={scrollTo}
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

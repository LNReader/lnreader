import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dimensions, NativeModules, NativeEventEmitter } from 'react-native';

import VolumeButtonListener from '@utils/volumeButtonListener';

import { useDispatch } from 'react-redux';
import { Portal } from 'react-native-paper';
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
import { createDrawerNavigator } from '@react-navigation/drawer';
import { htmlToText } from '@plugins/helpers/htmlToText';
import ChapterLoadingScreen from './ChapterLoadingScreen/ChapterLoadingScreen';
import { ErrorScreenV2 } from '@components';

const Chapter = ({ route }) => {
  const DrawerNav = createDrawerNavigator();
  return (
    <DrawerNav.Navigator
      params={route.params}
      drawerContent={props => <ChapterDrawer {...props} />}
    >
      <DrawerNav.Screen
        name="ChapterContent"
        initialParams={route.params}
        options={{ headerShown: false }}
        component={ChapterContent}
      />
    </DrawerNav.Navigator>
  );
};

const ChapterContent = ({ route, navigation }) => {
  useKeepAwake();
  const params = route.params;
  const { novel, chapter } = params;
  let webViewRef = useRef(null);
  let readerSheetRef = useRef(null);

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
  const minScroll = useRef(0);

  const { tracker, trackedNovels } = useTrackingStatus();
  const isTracked = trackedNovels.find(obj => obj.novel.id === chapter.novelId);

  const [sourceChapter, setChapter] = useState({ ...chapter });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const emmiter = useRef(
    new NativeEventEmitter(NativeModules.VolumeButtonListener),
  );

  const connectVolumeButton = () => {
    VolumeButtonListener.connect();
    VolumeButtonListener.preventDefault();
    emmiter.current.addListener('VolumeUp', e => {
      webViewRef.current?.injectJavaScript(`(()=>{
          window.scrollBy({top:${-Dimensions.get('window')
            .height},behavior:'smooth',})
        })()`);
    });
    emmiter.current.addListener('VolumeDown', e => {
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

  const onLayout = useCallback(e => {
    setTimeout(() => connectVolumeButton());
  }, []);

  const getChapter = async () => {
    try {
      const chapterText = await getChapterFromDB(chapter.id);
      if (chapterText) {
        sourceChapter.chapterText = chapterText;
      } else {
        sourceChapter.chapterText = await fetchChapter(
          novel.pluginId,
          chapter.url,
        );
      }
      setChapter(sourceChapter);
    } catch (e) {
      setError(e.message);
      showToast(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getChapter(chapter.id);
    if (!incognitoMode) {
      insertHistory(chapter.id);
      dispatch({
        type: SET_LAST_READ,
        payload: { lastRead: chapter },
      });
    }
  }, []);

  const [[nextChapter, prevChapter], setAdjacentChapter] = useState([]);
  useEffect(() => {
    const setPrevAndNextChap = async () => {
      const [nextChap, prevChap] = await Promise.all([
        getNextChapter(chapter.novelId, chapter.id),
        getPrevChapter(chapter.novelId, chapter.id),
      ]);
      setAdjacentChapter([nextChap, prevChap]);
    };
    setPrevAndNextChap();
  }, [chapter]);

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
    offsetY => {
      webViewRef?.current.injectJavaScript(`(()=>{
        window.scrollTo({top:${offsetY},behavior:'smooth',})
      })()`);
    },
    [webViewRef],
  );

  let scrollInterval;
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
    (offsetY, percentage) => {
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

  const navigateToChapterBySwipe = name => {
    let navChapter;
    if (name === 'SWIPE_LEFT') {
      navChapter = nextChapter;
    } else if (name === 'SWIPE_RIGHT') {
      navChapter = prevChapter;
    } else {
      return;
    }
    // you can add more condition for friendly usage. for example: if(name === "SWIPE_LEFT" || name === "right")
    navChapter
      ? navigation.replace('Chapter', {
          novel: novel,
          chapter: navChapter,
        })
      : showToast(
          name === 'SWIPE_LEFT'
            ? "There's no next chapter"
            : "There's no previous chapter",
        );
  };

  const onWebViewNavigationStateChange = async ({ url }) => {
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
  const openDrawer = () => {
    navigation.openDrawer();
    setHidden(true);
  };

  if (loading) {
    return <ChapterLoadingScreen />;
  }

  if (error) {
    return <ErrorScreenV2 error={error} />;
  }

  return (
    <>
      <WebViewReader
        chapterInfo={{ novel, chapter }}
        html={chapterText}
        chapterName={chapter.name}
        swipeGestures={swipeGestures}
        minScroll={minScroll}
        nextChapter={nextChapter}
        webViewRef={webViewRef}
        onLayout={() => {
          useVolumeButtons && onLayout();
          scrollTo(position?.offsetY);
        }}
        onPress={hideHeader}
        doSaveProgress={doSaveProgress}
        navigateToChapterBySwipe={navigateToChapterBySwipe}
        onWebViewNavigationStateChange={onWebViewNavigationStateChange}
      />
      <BottomInfoBar
        scrollPercentage={
          position?.percentage || Math.round(minScroll.current) || 0
        }
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

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Dimensions, NativeModules, NativeEventEmitter } from 'react-native';

import VolumeButtonListener from './../../utils/volumeButtonListener';

import { useDispatch } from 'react-redux';
import { useKeepAwake } from 'expo-keep-awake';

import {
  getNextChapter,
  getPrevChapter,
} from '../../database/queries/ChapterQueries';
import { fetchChapter } from '../../services/Source/source';
import { showToast } from '../../hooks/showToast';
import { usePosition, useSettings } from '../../hooks/reduxHooks';
import { useTrackerReducer } from '@redux/hooks';

import { useTheme } from '@hooks/useTheme';
import { updateChaptersRead } from '../../redux/tracker/tracker.actions';
import { markChapterReadAction } from '../../redux/novel/novel.actions';
import { saveScrollPosition } from '../../redux/preferences/preference.actions';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import ReaderAppbar from './components/ReaderAppbar';
import ReaderFooter from './components/ReaderFooter';
import ReaderSeekBar from './components/ReaderSeekBar';

import { insertHistory } from '../../database/queries/HistoryQueries';
import { SET_LAST_READ } from '../../redux/preferences/preference.types';
import WebViewReader from './components/WebViewReader';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useFullscreenMode, useLibrarySettings } from '../../hooks';
import { getChapterFromDb } from '../../database/queries/DownloadQueries';
import ReaderBottomSheetV2 from './components/ReaderBottomSheet/ReaderBottomSheet';
import { defaultTo } from 'lodash-es';
import BottomInfoBar from './components/BottomInfoBar/BottomInfoBar';
import { sanitizeChapterText } from './utils/sanitizeChapterText';
import ChapterDrawer from './components/ChapterDrawer';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { htmlToText } from '../../sources/helpers/htmlToText';
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
  const {
    sourceId,
    chapterId,
    chapterUrl,
    novelId,
    novelUrl,
    novelName,
    chapterName,
    bookmark,
  } = params;
  let webViewRef = useRef(null);
  let readerSheetRef = useRef(null);

  const theme = useTheme();
  const dispatch = useDispatch();

  const {
    swipeGestures = false,
    useVolumeButtons = false,
    autoScroll = false,
    autoScrollInterval = 10,
    scrollAmount = Dimensions.get('window').height,
    autoScrollOffset = null,
    verticalSeekbar = true,
    removeExtraParagraphSpacing = false,
    bionicReading = false,
  } = useSettings();
  const { incognitoMode } = useLibrarySettings();

  const { setImmersiveMode, showStatusAndNavBar } = useFullscreenMode();

  const [hidden, setHidden] = useState(true);

  const position = usePosition(novelId, chapterId);
  const minScroll = useRef(0);

  const { tracker, trackedNovels } = useTrackerReducer();
  const isTracked = trackedNovels.find(obj => obj.novelId === novelId);

  const [chapter, setChapter] = useState({});
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
            window.scrollBy({top:${-defaultTo(
              scrollAmount,
              Dimensions.get('window').height,
            )},behavior:'smooth',})
          })()`);
    });
    emmiter.current.addListener('VolumeDown', e => {
      webViewRef.current?.injectJavaScript(`(()=>{
            window.scrollBy({top:${defaultTo(
              scrollAmount,
              Dimensions.get('window').height,
            )},behavior:'smooth',})
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
      emmiter.current.removeAllListeners('VolumeDown');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useVolumeButtons, scrollAmount, chapter]);

  const onLayout = useCallback(() => {
    if (useVolumeButtons) {
      setTimeout(() => connectVolumeButton());
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useVolumeButtons]);

  const getChapter = async id => {
    try {
      let result = null;
      if (!(id && (result = await getChapterFromDb(id)))) {
        result = await fetchChapter(sourceId, novelUrl, chapterUrl);
      }
      setChapter({ ...result, bookmark });
    } catch (e) {
      setError(e.message);
      showToast(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getChapter(chapterId);

    if (!incognitoMode) {
      insertHistory(novelId, chapterId);
      dispatch({
        type: SET_LAST_READ,
        payload: { novelId, chapterId },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [[nextChapter, prevChapter], setAdjacentChapter] = useState([]);

  useEffect(() => {
    const setPrevAndNextChap = async () => {
      const [nextChap, prevChap] = await Promise.all([
        getNextChapter(novelId, chapterId),
        getPrevChapter(novelId, chapterId),
      ]);
      setAdjacentChapter([nextChap, prevChap]);
    };
    setPrevAndNextChap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  const htmlText = useMemo(
    () => htmlToText(chapter?.chapterText).split('\n'),
    [chapter.chapterText],
  );
  const [ttsStatus, startTts] = useTextToSpeech(htmlText, () => {
    if (!incognitoMode) {
      dispatch(markChapterReadAction(chapterId, novelId));
      updateTracker();
    }
  });

  const scrollTo = useCallback(
    offsetY => {
      requestAnimationFrame(() => {
        webViewRef?.current?.injectJavaScript(`(()=>{
          window.scrollTo({top:${offsetY},behavior:'smooth'})
        })()`);
      });
    },
    [webViewRef],
  );

  let scrollInterval;
  useEffect(() => {
    if (autoScroll) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const chapterNumber = Number(parseChapterNumber(chapterName));
    isTracked &&
      chapterNumber &&
      Number.isInteger(chapterNumber) &&
      chapterNumber > isTracked.userData.progress &&
      dispatch(
        updateChaptersRead(
          tracker.name,
          isTracked.id,
          tracker.auth,
          chapterNumber,
        ),
      );
  };

  const doSaveProgress = useCallback(
    (offsetY, percentage) => {
      if (!incognitoMode) {
        dispatch(saveScrollPosition(offsetY, percentage, chapterId, novelId));
      }

      if (!incognitoMode && percentage >= 97) {
        // a relative number
        dispatch(markChapterReadAction(chapterId, novelId));
        updateTracker();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapter],
  );

  const hideHeader = useCallback(() => {
    setHidden(h => {
      if (!h) {
        setImmersiveMode();
      } else {
        showStatusAndNavBar();
      }
      return !h;
    });
  }, []);

  const navigateToChapterBySwipe = useCallback(
    name => {
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
            ...params,
            chapterUrl: navChapter.chapterUrl,
            chapterId: navChapter.chapterId,
            chapterName: navChapter.chapterName,
            bookmark: navChapter.bookmark,
          })
        : showToast(
            name === 'SWIPE_LEFT'
              ? "There's no next chapter"
              : "There's no previous chapter",
          );
    },
    [nextChapter, prevChapter],
  );

  const onWebViewNavigationStateChange = useCallback(async ({ url }) => {
    if ((sourceId === 50 || sourceId === 62) && url !== 'about:blank') {
      setLoading(true);
      const res = await fetchChapter(sourceId, novelUrl, url);
      setChapter(res);
      setLoading(false);
    }
  }, []);

  const scrollToSavedProgress = useCallback(
    () => scrollTo(position?.position),
    [],
  );

  const chapterText = useMemo(
    () =>
      sanitizeChapterText(chapter.chapterText, {
        removeExtraParagraphSpacing,
        bionicReading,
        sourceId,
      }),
    [chapter.chapterText, removeExtraParagraphSpacing, bionicReading, sourceId],
  );
  const openDrawer = () => {
    navigation.openDrawer();
    hideHeader();
  };

  const bookmarkChapter = () =>
    setChapter(prevVal => ({ ...prevVal, bookmark: !prevVal?.bookmark }));

  if (loading) {
    return <ChapterLoadingScreen />;
  }

  if (error) {
    return <ErrorScreenV2 error={error} />;
  }

  return (
    <>
      <WebViewReader
        chapterInfo={params}
        html={chapterText}
        chapterName={chapter.chapterName || chapterName}
        swipeGestures={swipeGestures}
        minScroll={minScroll}
        nextChapter={nextChapter}
        webViewRef={webViewRef}
        onLayout={onLayout}
        scrollToSavedProgress={scrollToSavedProgress}
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
            bookmarkChapter={bookmarkChapter}
            novelName={novelName}
            chapterId={chapterId}
            chapterName={chapterName || chapter.chapterName}
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
            chapterUrl={chapterUrl}
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

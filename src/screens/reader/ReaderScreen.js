import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

import VolumeButtonListener from './../../utils/volumeButtonListener';

import { useDispatch } from 'react-redux';
import { IconButton, Portal } from 'react-native-paper';
import { useKeepAwake } from 'expo-keep-awake';

import {
  getNextChapter,
  getPrevChapter,
} from '../../database/queries/ChapterQueries';
import { fetchChapter } from '../../services/Source/source';
import { showToast } from '../../hooks/showToast';
import {
  usePosition,
  useSettings,
  useTrackingStatus,
} from '../../hooks/reduxHooks';
import { useTheme } from '@hooks/useTheme';
import { updateChaptersRead } from '../../redux/tracker/tracker.actions';
import { markChapterReadAction } from '../../redux/novel/novel.actions';
import { saveScrollPosition } from '../../redux/preferences/preference.actions';
import { parseChapterNumber } from '../../utils/parseChapterNumber';

import ReaderAppbar from './components/ReaderAppbar';
import ReaderFooter from './components/ReaderFooter';
import ReaderSeekBar from './components/ReaderSeekBar';

import EmptyView from '../../components/EmptyView';

import GestureRecognizer from 'react-native-swipe-gestures';
import { insertHistory } from '../../database/queries/HistoryQueries';
import { SET_LAST_READ } from '../../redux/preferences/preference.types';
import TextReader from './components/TextReader';
import WebViewReader from './components/WebViewReader';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useFullscreenMode, useLibrarySettings } from '../../hooks';
import { getChapterFromDb } from '../../database/queries/DownloadQueries';
import ReaderBottomSheetV2 from './components/ReaderBottomSheet/ReaderBottomSheet';
import { useReaderSettings } from '../../redux/hooks';
import { defaultTo } from 'lodash';
import BottomInfoBar from './components/BottomInfoBar/BottomInfoBar';
import { sanitizeChapterText } from './utils/sanitizeChapterText';
import ChapterDrawer from './components/ChapterDrawer';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SkeletonLines from './components/SkeletonLines';
import color from 'color';
import { htmlToText } from '../../sources/helpers/htmlToText';

const Chapter = ({ route }) => {
  const { useChapterDrawerSwipeNavigation = true } = useSettings();
  const DrawerNav = createDrawerNavigator();
  return (
    <DrawerNav.Navigator
      params={route.params}
      drawerContent={props => <ChapterDrawer {...props} />}
      screenOptions={{
        swipeEdgeWidth: 60,
        swipeEnabled: useChapterDrawerSwipeNavigation,
      }}
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
  let scrollViewRef = useRef(null);
  let webViewRef = useRef(null);
  let readerSheetRef = useRef(null);

  const theme = useTheme();
  const dispatch = useDispatch();
  const readerSettings = useReaderSettings();

  const {
    swipeGestures = false,
    useWebViewForChapter = false,
    wvUseNewSwipes = false,
    wvShowSwipeMargins = true,
    wvUseVolumeButtons = false,
    autoScroll = false,
    autoScrollInterval = 10,
    autoScrollOffset = null,
    verticalSeekbar = true,
    removeExtraParagraphSpacing = false,
  } = useSettings();
  const { incognitoMode } = useLibrarySettings();

  const { setImmersiveMode, showStatusAndNavBar } = useFullscreenMode();

  const [hidden, setHidden] = useState(true);

  const { tracker, trackedNovels } = useTrackingStatus();
  const position = usePosition(novelId, chapterId);

  const isTracked = trackedNovels.find(obj => obj.novelId === novelId);

  const [chapter, setChapter] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const minScroll = useRef(0);
  const [currentScroll, setCurrentScroll] = useState({
    offsetY: 0,
    percentage: 0,
  });
  const [firstLayout, setFirstLayout] = useState(true);
  const [scrollPage, setScrollPage] = useState(null);

  useEffect(() => {
    VolumeButtonListener.disconnect();
    if (useWebViewForChapter && wvUseVolumeButtons) {
      VolumeButtonListener.connect();
      VolumeButtonListener.preventDefault();
      const emmiter = new NativeEventEmitter(
        NativeModules.VolumeButtonListener,
      );
      emmiter.removeAllListeners('VolumeUp');
      emmiter.removeAllListeners('VolumeDown');
      const upSub = emmiter.addListener('VolumeUp', e => {
        setScrollPage('up');
      });
      const downSub = emmiter.addListener('VolumeDown', e => {
        setScrollPage('down');
      });
      return () => {
        VolumeButtonListener.disconnect();
        upSub?.remove();
        downSub?.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (wvUseVolumeButtons) {
      VolumeButtonListener.connect();
    } else {
      VolumeButtonListener.disconnect();
    }
  }, [wvUseVolumeButtons]);

  const getChapter = async id => {
    try {
      let result = null;
      if (!(id && (result = await getChapterFromDb(id)))) {
        result = await fetchChapter(sourceId, novelUrl, chapterUrl);
      }
      setChapter(result);
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
  }, [chapter]);

  const [ttsStatus, startTts] = useTextToSpeech(
    htmlToText(chapter?.chapterText).split('\n'),
    () => {
      if (!incognitoMode) {
        dispatch(markChapterReadAction(chapterId, novelId));
        updateTracker();
      }
    },
  );

  const [currentOffset, setCurrentOffset] = useState(position?.position || 0);

  let scrollTimeout;

  useEffect(() => {
    if (currentScroll.percentage !== 100 && autoScroll) {
      scrollTimeout = setTimeout(() => {
        scrollViewRef.current.scrollTo({
          x: 0,
          y:
            currentOffset +
            defaultTo(autoScrollOffset, Dimensions.get('window').height),
          animated: true,
        });
        setCurrentOffset(
          prevState =>
            prevState +
            defaultTo(autoScrollOffset, Dimensions.get('window').height),
        );
      }, autoScrollInterval * 1000);
    }

    return () => clearTimeout(scrollTimeout);
  }, [autoScroll, currentOffset]);

  const updateTracker = () => {
    const chapterNumber = parseChapterNumber(chapterName);

    isTracked &&
      chapterNumber &&
      Number.isInteger(chapterNumber) &&
      chapterNumber > isTracked.my_list_status.num_chapters_read &&
      dispatch(
        updateChaptersRead(isTracked.id, tracker.access_token, chapterNumber),
      );
  };

  const doSaveProgress = (offsetY, percentage) => {
    if (!incognitoMode) {
      dispatch(saveScrollPosition(offsetY, percentage, chapterId, novelId));
    }

    if (!incognitoMode && percentage >= 97) {
      // a relative number
      dispatch(markChapterReadAction(chapterId, novelId));
      updateTracker();
    }
  };

  const onScroll = useCallback(({ nativeEvent }) => {
    const offsetY = nativeEvent.contentOffset.y;
    const pos =
      nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height;

    const percentage = Math.round((pos / nativeEvent.contentSize.height) * 100);
    if (offsetY != 0 && percentage != 100) {
      // because the content is set to 0 when closing layout (i guess)
      setCurrentScroll({ offsetY: offsetY, percentage: percentage });
    }
    if (
      nativeEvent.contentSize.height != nativeEvent.layoutMeasurement.height &&
      nativeEvent.contentSize.height > 0
    ) {
      doSaveProgress(offsetY, percentage);
    }
  }, []);

  const onLayoutProcessing = useCallback(
    event => {
      const scrollToSavedProgress = () => {
        if (position) {
          if (useWebViewForChapter) {
            webViewRef.current.injectJavaScript(`(()=>{
              window.scrollTo({top: ${position.position}, left:0, behavior:"instant"});
            })()`);
          } else {
            scrollViewRef.current.scrollTo({
              x: 0,
              y: position.position,
              animated: false,
            });
          }
        }
        if (firstLayout) {
          setFirstLayout(false);
        }
      };

      scrollToSavedProgress();
      if (!useWebViewForChapter) {
        minScroll.current =
          (Dimensions.get('window').height / event.nativeEvent.layout.height) *
          100;
      }
    },
    [nextChapter, useWebViewForChapter],
  );

  const hideHeader = () => {
    if (!hidden) {
      if (useWebViewForChapter && wvUseVolumeButtons) {
        VolumeButtonListener.connect();
      }
      setImmersiveMode();
    } else {
      if (useWebViewForChapter && wvUseVolumeButtons) {
        VolumeButtonListener.disconnect();
      }
      showStatusAndNavBar();
    }
    setHidden(!hidden);
  };

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 50,
  };

  const navigateToPrevChapter = () => {
    prevChapter
      ? navigation.replace('Chapter', {
          ...params,
          chapterUrl: prevChapter.chapterUrl,
          chapterId: prevChapter.chapterId,
          chapterName: prevChapter.chapterName,
          bookmark: prevChapter.bookmark,
        })
      : showToast("There's no previous chapter");
  };

  const navigateToNextChapter = () => {
    nextChapter
      ? navigation.replace('Chapter', {
          ...params,
          chapterUrl: nextChapter.chapterUrl,
          chapterId: nextChapter.chapterId,
          chapterName: nextChapter.chapterName,
          bookmark: nextChapter.bookmark,
        })
      : showToast("There's no next chapter");
  };

  const onWebViewNavigationStateChange = async ({ url }) => {
    if ((sourceId === 50 || sourceId === 62) && url !== 'about:blank') {
      setLoading(true);
      const res = await fetchChapter(sourceId, novelUrl, url);
      setChapter(res);
      setLoading(false);
    }
  };

  const backgroundColor = readerSettings.theme;
  const chapterText = sanitizeChapterText(chapter.chapterText, {
    removeExtraParagraphSpacing,
  });
  const openDrawer = () => {
    navigation.openDrawer();
    setHidden(true);
  };
  return (
    <>
      <>
        <ReaderAppbar
          bookmark={bookmark}
          novelName={novelName}
          chapterId={chapterId}
          chapterName={chapterName || chapter.chapterName}
          hide={hidden}
          dispatch={dispatch}
          tts={startTts}
          textToSpeech={ttsStatus}
          theme={theme}
        />
        <GestureRecognizer
          onSwipeRight={
            swipeGestures &&
            (!useWebViewForChapter || !wvUseNewSwipes) &&
            navigateToPrevChapter
          }
          onSwipeLeft={
            swipeGestures &&
            (!useWebViewForChapter || !wvUseNewSwipes) &&
            navigateToNextChapter
          }
          config={config}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.screenContainer,
              { backgroundColor },
            ]}
            onScroll={!loading && onScroll}
            showsVerticalScrollIndicator={false}
          >
            {error ? (
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <EmptyView
                  icon="Σ(ಠ_ಠ)"
                  description={error}
                  style={{ color: readerSettings.textColor }}
                >
                  <IconButton
                    icon="reload"
                    size={25}
                    style={{ margin: 0, marginTop: 16 }}
                    iconColor={readerSettings.textColor}
                    onPress={() => {
                      getChapter(chapterId);
                      setLoading(true);
                      setError();
                    }}
                  />
                  <Text style={{ color: readerSettings.textColor }}>Retry</Text>
                </EmptyView>
              </View>
            ) : loading ? (
              <SkeletonLines
                containerMargin={readerSettings.padding + '%'}
                containerHeight={'100%'}
                containerWidth={'100%'}
                color={
                  color(backgroundColor).isDark()
                    ? color(backgroundColor).luminosity() !== 0
                      ? color(backgroundColor).lighten(0.1).toString()
                      : color(backgroundColor).negate().darken(0.98).toString()
                    : color(backgroundColor).darken(0.04).toString()
                }
                highlightColor={
                  color(backgroundColor).isDark()
                    ? color(backgroundColor).luminosity() !== 0
                      ? color(backgroundColor).lighten(0.4).toString()
                      : color(backgroundColor).negate().darken(0.92).toString()
                    : color(backgroundColor).darken(0.08).toString()
                }
                textSize={readerSettings.textSize}
                lineHeight={readerSettings.lineHeight}
              />
            ) : (
              <TouchableWithoutFeedback
                style={{ flex: 1 }}
                onLayout={onLayoutProcessing}
              >
                {useWebViewForChapter ? (
                  <View style={{ flex: 1 }}>
                    <WebViewReader
                      theme={theme}
                      chapter={chapter}
                      html={chapterText}
                      reader={readerSettings}
                      chapterName={chapter.chapterName || chapterName}
                      layoutHeight={Dimensions.get('window').height}
                      swipeGestures={swipeGestures && wvUseNewSwipes}
                      minScroll={minScroll}
                      currentScroll={currentScroll}
                      scrollPage={scrollPage}
                      wvShowSwipeMargins={wvShowSwipeMargins}
                      nextChapter={nextChapter}
                      webViewRef={webViewRef}
                      onPress={hideHeader}
                      setCurrentScroll={setCurrentScroll}
                      setScrollPage={setScrollPage}
                      doSaveProgress={doSaveProgress}
                      navigateToNextChapter={() => navigateToNextChapter()}
                      navigateToPrevChapter={() => navigateToPrevChapter()}
                      onWebViewNavigationStateChange={
                        onWebViewNavigationStateChange
                      }
                    />
                  </View>
                ) : (
                  <View>
                    <TextReader
                      theme={theme}
                      chapterName={chapter.chapterName || chapterName}
                      text={chapterText}
                      reader={readerSettings}
                      nextChapter={nextChapter}
                      onPress={hideHeader}
                      navigateToNextChapter={navigateToNextChapter}
                    />
                  </View>
                )}
              </TouchableWithoutFeedback>
            )}
          </ScrollView>
        </GestureRecognizer>
        <BottomInfoBar scrollPercentage={currentScroll.percentage || 0} />
        <Portal>
          <ReaderBottomSheetV2 bottomSheetRef={readerSheetRef} />
        </Portal>
        <ReaderSeekBar
          hide={hidden}
          theme={theme}
          verticalSeekbar={verticalSeekbar}
          currentScroll={currentScroll}
          useWebViewForChapter={useWebViewForChapter}
          minScroll={minScroll.current}
          scrollViewRef={scrollViewRef}
          webViewRef={webViewRef}
          setCurrentScroll={setCurrentScroll}
        />
        <ReaderFooter
          hide={hidden}
          theme={theme}
          chapterUrl={chapterUrl}
          nextChapter={nextChapter}
          prevChapter={prevChapter}
          useWebViewForChapter={useWebViewForChapter}
          readerSheetRef={readerSheetRef}
          scrollViewRef={scrollViewRef}
          navigateToNextChapter={navigateToNextChapter}
          navigateToPrevChapter={navigateToPrevChapter}
          openDrawer={openDrawer}
        />
      </>
    </>
  );
};

export default Chapter;

const styles = StyleSheet.create({
  screenContainer: { flexGrow: 1 },
  scrollPercentageContainer: {
    width: '100%',
    position: 'absolute',
    paddingVertical: 4,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    flexDirection: 'row',
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

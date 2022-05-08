import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';

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
  useTheme,
  useTrackingStatus,
} from '../../hooks/reduxHooks';
import { updateChaptersRead } from '../../redux/tracker/tracker.actions';
import { readerBackground, readerTextColor } from './utils/readerStyles';
import { markChapterReadAction } from '../../redux/novel/novel.actions';
import { saveScrollPosition } from '../../redux/preferences/preference.actions';
import { parseChapterNumber } from '../../utils/parseChapterNumber';

import ReaderAppbar from './components/ReaderAppbar';
import ReaderFooter from './components/ReaderFooter';
import ReaderSeekBar from './components/ReaderSeekBar';

import EmptyView from '../../components/EmptyView';

import GestureRecognizer from 'react-native-swipe-gestures';
import { LoadingScreen } from '../../components/LoadingScreen/LoadingScreen';
import { insertHistory } from '../../database/queries/HistoryQueries';
import { SET_LAST_READ } from '../../redux/preferences/preference.types';
import { setAppSettings } from '../../redux/settings/settings.actions';
import { useBatteryLevel } from 'react-native-device-info';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextReader from './components/TextReader';
import WebViewReader from './components/WebViewReader';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useFullscreenMode } from '../../hooks';
import { getChapterFromDb } from '../../database/queries/DownloadQueries';
import ReaderBottomSheetV2 from './components/ReaderBottomSheet/ReaderBottomSheet';
import { useReaderSettings } from '../../redux/hooks';
import { defaultTo } from 'lodash';

const Chapter = ({ route, navigation }) => {
  useKeepAwake();

  const {
    sourceId,
    chapterId,
    chapterUrl,
    novelId,
    novelUrl,
    novelName,
    chapterName,
    bookmark,
  } = route.params;

  let scrollViewRef = useRef(null);
  let readerSheetRef = useRef(null);

  const theme = useTheme();
  const dispatch = useDispatch();
  const readerSettings = useReaderSettings();
  const insets = useSafeAreaInsets();

  const {
    showScrollPercentage = true,
    fullScreenMode = true,
    swipeGestures = false,
    incognitoMode = false,
    textSelectable = false,
    useWebViewForChapter = false,
    showBatteryAndTime = false,
    autoScroll = false,
    autoScrollInterval = 10,
    autoScrollOffset = null,
    verticalSeekbar = true,
  } = useSettings();

  const { setImmersiveMode, showStatusAndNavBar } = useFullscreenMode();

  const batteryLevel = useBatteryLevel();

  const [hidden, setHidden] = useState(true);

  const { tracker, trackedNovels } = useTrackingStatus();
  const position = usePosition(novelId, chapterId);

  const isTracked = trackedNovels.find(obj => obj.novelId === novelId);

  const [chapter, setChapter] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [firstLayout, setFirstLayout] = useState(true);

  const [contentSize, setContentSize] = useState(0);

  const getChapter = async id => {
    try {
      if (id) {
        const chapterDownloaded = await getChapterFromDb(chapterId);

        if (chapterDownloaded) {
          setChapter(chapterDownloaded);
        } else {
          const res = await fetchChapter(sourceId, novelUrl, chapterUrl);
          setChapter(res);
        }
      } else {
        const res = await fetchChapter(sourceId, novelUrl, chapterUrl);

        setChapter(res);
      }

      setLoading(false);
    } catch (e) {
      setError(e.message);
      setLoading(false);
      showToast(e.message);
    }
  };

  const [nextChapter, setNextChapter] = useState({});
  const [prevChapter, setPrevChapter] = useState({});

  const setPrevAndNextChap = async () => {
    const nextChap = await getNextChapter(novelId, chapterId);
    const prevChap = await getPrevChapter(novelId, chapterId);

    setNextChapter(nextChap);
    setPrevChapter(prevChap);
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

  const [ttsStatus, ttsPosition, startTts, pauseTts] = useTextToSpeech(
    chapter?.chapterText,
  );

  useEffect(() => {
    setPrevAndNextChap();
  }, [chapter]);

  const [currentTime, setCurrentTime] = useState();

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const [currentOffset, setCurrentOffset] = useState(position?.position || 0);

  let scrollTimeout;

  useEffect(() => {
    if (!useWebViewForChapter && scrollPercentage !== 100 && autoScroll) {
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

  const isCloseToBottom = useCallback(
    ({ layoutMeasurement, contentOffset, contentSize }) => {
      const paddingToBottom = 40;
      return (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom
      );
    },
    [],
  );

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

  const onScroll = useCallback(({ nativeEvent }) => {
    const offsetY = nativeEvent.contentOffset.y;
    const pos =
      nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height;

    const percentage = Math.round((pos / nativeEvent.contentSize.height) * 100);
    setScrollPercentage(percentage);

    if (!incognitoMode) {
      dispatch(saveScrollPosition(offsetY, percentage, chapterId, novelId));
    }

    if (!incognitoMode && isCloseToBottom(nativeEvent)) {
      dispatch(markChapterReadAction(chapterId, novelId));
      updateTracker();
    }
  }, []);

  const scrollToSavedProgress = useCallback(event => {
    if (position && firstLayout) {
      position.percentage < 100 &&
        scrollViewRef.current.scrollTo({
          x: 0,
          y: position.position,
          animated: false,
        });
      setFirstLayout(false);
    }
  }, []);

  const hideHeader = () => {
    if (!hidden) {
      setImmersiveMode();
    } else {
      showStatusAndNavBar();
    }
    setHidden(!hidden);
  };

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  const navigateToPrevChapter = () =>
    prevChapter
      ? navigation.replace('Chapter', {
          chapterUrl: prevChapter.chapterUrl,
          chapterId: prevChapter.chapterId,
          sourceId,
          novelUrl,
          novelId,
          chapterName: prevChapter.chapterName,
          novelName,
          bookmark: prevChapter.bookmark,
        })
      : showToast("There's no previous chapter");

  const navigateToNextChapter = () =>
    nextChapter
      ? navigation.replace('Chapter', {
          chapterUrl: nextChapter.chapterUrl,
          sourceId,
          novelUrl,
          novelId,
          chapterId: nextChapter.chapterId,
          chapterName: nextChapter.chapterName,
          novelName,
          bookmark: nextChapter.bookmark,
        })
      : showToast("There's no next chapter");

  const enableAutoScroll = () =>
    dispatch(setAppSettings('autoScroll', !autoScroll));

  const enableWebView = () =>
    dispatch(setAppSettings('useWebViewForChapter', !useWebViewForChapter));

  const onWebViewNavigationStateChange = async ({ url }) => {
    if ((sourceId === 50 || sourceId === 62) && url !== 'about:blank') {
      setLoading(true);
      const res = await fetchChapter(sourceId, novelUrl, url);
      setChapter(res);
      setLoading(false);
    }
  };

  const backgroundColor = readerBackground(readerSettings.theme);

  return (
    <>
      <>
        <ReaderAppbar
          novelName={novelName}
          chapterName={chapterName || chapter.chapterName}
          chapterId={chapterId}
          bookmark={bookmark}
          textToSpeech={ttsStatus}
          tts={startTts}
          readerSheetRef={readerSheetRef}
          hide={hidden}
          navigation={navigation}
          dispatch={dispatch}
          theme={theme}
          textToSpeechPosition={ttsPosition}
          pauseTts={pauseTts}
        />
        <GestureRecognizer
          onSwipeRight={swipeGestures && navigateToPrevChapter}
          onSwipeLeft={swipeGestures && navigateToNextChapter}
          config={config}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={ref => (scrollViewRef.current = ref)}
            contentContainerStyle={[
              styles.screenContainer,
              { backgroundColor },
            ]}
            onScroll={onScroll}
            onContentSizeChange={(x, y) => setContentSize(y)}
            showsVerticalScrollIndicator={false}
          >
            {error ? (
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <EmptyView
                  icon="Σ(ಠ_ಠ)"
                  description={error}
                  style={{
                    color:
                      readerSettings.textColor ||
                      readerTextColor(readerSettings.theme),
                  }}
                >
                  <IconButton
                    icon="reload"
                    size={25}
                    style={{ margin: 0, marginTop: 16 }}
                    color={
                      readerSettings.textColor ||
                      readerTextColor(readerSettings.theme)
                    }
                    onPress={() => {
                      getChapter(chapterId);
                      setLoading(true);
                      setError();
                    }}
                  />
                  <Text
                    style={{
                      color:
                        readerSettings.textColor ||
                        readerTextColor(readerSettings.theme),
                    }}
                  >
                    Retry
                  </Text>
                </EmptyView>
              </View>
            ) : loading ? (
              <LoadingScreen theme={theme} />
            ) : (
              <TouchableWithoutFeedback
                style={{ flex: 1 }}
                onPress={hideHeader}
                onLayout={scrollToSavedProgress}
              >
                {useWebViewForChapter ? (
                  <View style={{ flex: 1 }}>
                    <WebViewReader
                      reader={readerSettings}
                      html={chapter.chapterText}
                      onScroll={onScroll}
                      onWebViewNavigationStateChange={
                        onWebViewNavigationStateChange
                      }
                      theme={theme}
                    />
                  </View>
                ) : (
                  <View>
                    <TextReader
                      text={chapter.chapterText}
                      reader={readerSettings}
                      chapterName={chapter.chapterName || chapterName}
                      textSelectable={textSelectable}
                      theme={theme}
                      nextChapter={nextChapter}
                      navigateToNextChapter={navigateToNextChapter}
                    />
                  </View>
                )}
              </TouchableWithoutFeedback>
            )}
          </ScrollView>
        </GestureRecognizer>

        <Portal>
          <ReaderBottomSheetV2 bottomSheetRef={readerSheetRef} />
        </Portal>
        {!useWebViewForChapter && (
          <ReaderSeekBar
            theme={theme}
            hide={hidden}
            setLoading={setLoading}
            contentSize={contentSize}
            scrollViewRef={scrollViewRef}
            scrollPercentage={scrollPercentage}
            setScrollPercentage={setScrollPercentage}
            verticalSeekbar={verticalSeekbar}
          />
        )}
        <ReaderFooter
          theme={theme}
          novelUrl={novelUrl}
          chapterUrl={chapterUrl}
          enableWebView={enableWebView}
          dispatch={dispatch}
          nextChapter={nextChapter}
          prevChapter={prevChapter}
          hide={hidden}
          autoScroll={autoScroll}
          useWebViewForChapter={useWebViewForChapter}
          navigateToNextChapter={navigateToNextChapter}
          navigateToPrevChapter={navigateToPrevChapter}
          readerSheetRef={readerSheetRef}
          scrollViewRef={scrollViewRef}
          enableAutoScroll={enableAutoScroll}
        />
        {(showScrollPercentage || showBatteryAndTime) && (
          <View
            style={[
              styles.scrollPercentageContainer,
              { backgroundColor },
              !fullScreenMode && {
                paddingBottom: insets.bottom,
              },
            ]}
          >
            {showBatteryAndTime && (
              <Text style={{ color: readerSettings.textColor }}>
                {Math.ceil(batteryLevel * 100) + '%'}
              </Text>
            )}
            {showScrollPercentage && (
              <Text
                style={{
                  flex: 1,
                  color: readerSettings.textColor,
                  textAlign: 'center',
                }}
              >
                {scrollPercentage + '%'}
              </Text>
            )}
            {showBatteryAndTime && (
              <Text style={{ color: readerSettings.textColor }}>
                {moment(currentTime).format('h:mm')}
              </Text>
            )}
          </View>
        )}
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

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import GestureRecognizer from 'react-native-swipe-gestures';

import RenderHtml from 'react-native-render-html';

import {Button, EmptyView, ErrorScreen, LoadingScreen} from '../../components';

import {useAppDispatch, useReaderSettings, useTheme} from '../../redux/hooks';
import {useChapter, useFullscreenMode, useNextAndPrevChapter} from './hooks';
import {ReaderAppbar, ReaderBottomSheet, ReaderFooter} from './components';
import {Portal} from 'react-native-paper';

import {updateChapterRead} from '../../redux/novel/novelSlice';
import {insertHistoryInDb} from '../../database/queries/HistoryQueries';
import {updateChapterReadInDb} from '../../database/queries/ChapterQueries';
import WebViewReader from './components/WebViewReader/WebViewReader';
import {useChapterProgress} from './hooks/useChapterProgress';
import BottomInfoBar from './components/BottomInfoBar/BottomInfoBar';

interface ReaderScreenProps {
  route: {
    params: {
      sourceId: number;
      novelId: number;
      novelName?: string;
      chapterId: number;
      chapterUrl: string;
      novelUrl: string;
      isBookmarked: number;
    };
  };
}

const ReaderScreen: React.FC<ReaderScreenProps> = ({route}) => {
  const {
    sourceId,
    novelId,
    novelName,
    chapterId,
    chapterUrl,
    novelUrl,
    isBookmarked,
  } = route.params;

  const dispatch = useAppDispatch();

  const theme = useTheme();
  const {width} = useWindowDimensions();

  const {setImmersiveMode, showStatusAndNavBar} = useFullscreenMode();

  let bottomSheetRef = useRef<any>(null);
  const expandBottomSheet = () => bottomSheetRef.current.show();

  let readerRef = useRef<ScrollView | null>(null);

  const {
    backgroundColor,
    textColor,
    paddingHorizontal,
    lineHeight,
    fontFamily,
    fontSize,
    useWebViewReader,
    useSwipeGestures,
  } = useReaderSettings();

  const {isLoading, chapter, error} = useChapter(
    sourceId,
    chapterId,
    chapterUrl,
    novelUrl,
  );

  const {progressPercentage, setProgress, scrollToSavedProgress} =
    useChapterProgress(chapterId, readerRef);

  const {
    isLoading: isNextAndPrevChapLoading,
    nextChapter,
    previousChapter,
    navigateToNextChapter,
    navigateToPrevChapter,
  } = useNextAndPrevChapter(sourceId, novelId, chapterId);

  const [menuVisible, setMenuVisble] = useState(false);
  const toggleMenu = () => {
    setMenuVisble(!menuVisible);
    if (menuVisible) {
      setImmersiveMode();
    } else {
      showStatusAndNavBar();
    }
  };

  useEffect(() => {
    insertHistoryInDb(novelId, chapterId);
  }, [novelId, chapterId]);

  const onChapterEndReached = useCallback(
    ({layoutMeasurement, contentOffset, contentSize}: any) => {
      const paddingToBottom = 80;
      return (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom
      );
    },
    [],
  );

  const onScroll = ({nativeEvent}: {nativeEvent: any}) => {
    setProgress({nativeEvent});

    if (onChapterEndReached(nativeEvent)) {
      dispatch(updateChapterRead(chapterId));
      updateChapterReadInDb(1, chapterId);
    }
  };

  const handleSwipeLeft = () => {
    if (useSwipeGestures) {
      navigateToNextChapter();
    }
  };

  const handleSwipeRight = () => {
    if (useSwipeGestures) {
      navigateToPrevChapter();
    }
  };

  return (
    <>
      <ReaderAppbar
        novelName={novelName}
        chapterName={chapter?.chapterName || ''}
        chapterUrl={chapterUrl}
        visible={menuVisible}
        theme={theme}
      />
      {isLoading ? (
        <LoadingScreen theme={theme} />
      ) : error ? (
        <ErrorScreen error={error} theme={theme} />
      ) : (
        <>
          <GestureRecognizer
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            config={{velocityThreshold: 0.3, directionalOffsetThreshold: 80}}
            style={{flex: 1}}
          >
            <ScrollView
              contentContainerStyle={[styles.scrollView, {backgroundColor}]}
              onScroll={onScroll}
              ref={ref => (readerRef.current = ref)}
              showsVerticalScrollIndicator={false}
            >
              <TouchableWithoutFeedback
                onPress={toggleMenu}
                style={[styles.container]}
                onLayout={scrollToSavedProgress}
              >
                {chapter?.chapterText ? (
                  useWebViewReader ? (
                    <WebViewReader
                      html={chapter.chapterText}
                      onScroll={onScroll}
                    />
                  ) : (
                    <RenderHtml
                      contentWidth={width}
                      source={{html: chapter.chapterText}}
                      defaultTextProps={{
                        style: {
                          color: textColor,
                          fontFamily: fontFamily || '',
                          lineHeight: fontSize * lineHeight,
                          fontSize,
                        },
                        selectable: true,
                      }}
                      defaultViewProps={{
                        style: {
                          backgroundColor,
                        },
                      }}
                      baseStyle={{
                        padding: `${paddingHorizontal}%`,
                      }}
                    />
                  )
                ) : (
                  <EmptyView
                    description="Chapter is empty. Report if it's available in webview."
                    theme={theme}
                  />
                )}
                {!useWebViewReader ? (
                  <View style={styles.buttonContainer}>
                    <Text style={[styles.finished, {color: textColor}]}>
                      {chapter?.chapterName
                        ? `Finished: ${chapter?.chapterName}`
                        : 'Finished'}
                    </Text>
                    {!isNextAndPrevChapLoading ? (
                      <Button
                        margin={8}
                        title={`Next Chapter: ${nextChapter?.chapterName}`}
                        onPress={navigateToNextChapter}
                        theme={theme}
                      />
                    ) : (
                      <ActivityIndicator size="small" color={theme.primary} />
                    )}
                  </View>
                ) : null}
              </TouchableWithoutFeedback>
            </ScrollView>
          </GestureRecognizer>

          <BottomInfoBar
            percentage={progressPercentage}
            background={backgroundColor}
            color={textColor}
          />
        </>
      )}
      <ReaderFooter
        visible={menuVisible}
        chapterId={chapterId}
        chapterUrl={chapterUrl}
        isBookmarked={isBookmarked}
        previousChapter={previousChapter}
        navigateToPrevChapter={navigateToPrevChapter}
        nextChapter={nextChapter}
        navigateToNextChapter={navigateToNextChapter}
        expandBottomSheet={expandBottomSheet}
        theme={theme}
      />
      <Portal>
        <ReaderBottomSheet bottomSheetRef={bottomSheetRef} theme={theme} />
      </Portal>
    </>
  );
};

export default ReaderScreen;

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  container: {
    height: '100%',
    paddingTop: 40,
  },
  finished: {
    textAlign: 'center',
    marginVertical: 8,
  },
  buttonContainer: {
    margin: 8,
  },
  flex: {
    flex: 1,
  },
});

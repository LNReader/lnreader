import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Text,
  View,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

import RenderHtml from 'react-native-render-html';

import {Button, EmptyView, ErrorScreen, LoadingScreen} from '../../components';

import {useAppDispatch, useReaderSettings, useTheme} from '../../redux/hooks';
import {useChapter, useFullscreenMode, useNextAndPrevChapter} from './hooks';
import {ReaderAppbar, ReaderBottomSheet, ReaderFooter} from './components';
import {Portal} from 'react-native-paper';

import {updateChapterRead} from '../../redux/novel/novelSlice';
import {insertHistoryInDb} from '../../database/queries/HistoryQueries';
import {updateChapterReadInDb} from '../../database/queries/ChapterQueries';

interface ReaderScreenProps {
  route: {
    params: {
      sourceId: number;
      novelId: number;
      novelName?: string;
      chapterId: number;
      chapterUrl: string;
      isBookmarked: number;
    };
  };
}

const ReaderScreen: React.FC<ReaderScreenProps> = ({route}) => {
  const {sourceId, novelId, novelName, chapterId, chapterUrl, isBookmarked} =
    route.params;

  const dispatch = useAppDispatch();

  const theme = useTheme();
  const {width} = useWindowDimensions();

  const {setImmersiveMode, showStatusAndNavBar} = useFullscreenMode();

  let bottomSheetRef = useRef<any>(null);
  const expandBottomSheet = () => bottomSheetRef.current.show();

  const {
    backgroundColor,
    textColor,
    paddingHorizontal,
    lineHeight,
    fontFamily,
    fontSize,
  } = useReaderSettings();

  const {isLoading, chapter, error} = useChapter(
    sourceId,
    chapterId,
    chapterUrl,
  );

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
    if (onChapterEndReached(nativeEvent)) {
      dispatch(updateChapterRead(chapterId));
      updateChapterReadInDb(1, chapterId);
    }
  };

  return (
    <>
      <ReaderAppbar
        novelName={novelName}
        chapterName={chapter?.chapterName}
        chapterUrl={chapterUrl}
        visible={menuVisible}
        theme={theme}
      />
      {isLoading ? (
        <LoadingScreen theme={theme} />
      ) : error ? (
        <ErrorScreen error={error} theme={theme} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollView, {backgroundColor}]}
          onScroll={onScroll}
        >
          <TouchableWithoutFeedback
            onPress={toggleMenu}
            style={[styles.container]}
          >
            {chapter?.chapterText ? (
              <RenderHtml
                contentWidth={width}
                source={{html: chapter?.chapterText}}
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
            ) : (
              <EmptyView
                description="Chapter is empty.\n\nReport if it's available in webview."
                theme={theme}
              />
            )}
            <View style={styles.buttonContainer}>
              <Text style={[styles.finished, {color: textColor}]}>
                {chapter?.chapterName
                  ? `Finished: ${chapter?.chapterName}`
                  : 'Finished'}
              </Text>
              {!isNextAndPrevChapLoading ? (
                <Button
                  title={`Next Chapter: ${nextChapter?.chapterName}`}
                  onPress={navigateToNextChapter}
                  theme={theme}
                />
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
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
    flex: 1,
    paddingTop: 40,
    paddingBottom: 80,
  },
  finished: {
    textAlign: 'center',
    marginVertical: 8,
  },
  buttonContainer: {
    margin: 8,
  },
});

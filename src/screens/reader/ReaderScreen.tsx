import React, { useRef, useCallback } from 'react';
import { DrawerLayoutAndroid } from 'react-native';

import { showToast } from '@utils/showToast';
import {
  useChapterGeneralSettings,
  useTheme,
  useNovel,
} from '@hooks/persisted';

import ReaderAppbar from './components/ReaderAppbar';
import ReaderFooter from './components/ReaderFooter';

import WebViewReader from './components/WebViewReader';
import ReaderBottomSheetV2 from './components/ReaderBottomSheet/ReaderBottomSheet';
import ChapterDrawer from './components/ChapterDrawer';
import ChapterLoadingScreen from './ChapterLoadingScreen/ChapterLoadingScreen';
import { ErrorScreenV2 } from '@components';
import { ChapterScreenProps } from '@navigators/types';
import WebView from 'react-native-webview';
import { getString } from '@strings/translations';
import KeepScreenAwake from './components/KeepScreenAwake';
import useChapter from './hooks/useChapter';

const Chapter = ({ route, navigation }: ChapterScreenProps) => {
  const drawerRef = useRef<DrawerLayoutAndroid>(null);
  const { chapters, novelSettings, pages, setPageIndex } = useNovel(
    route.params.novel.path,
    route.params.novel.pluginId,
  );
  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={300}
      drawerPosition="left"
      renderNavigationView={() => (
        <ChapterDrawer
          route={route}
          navigation={navigation}
          chapters={chapters}
          novelSettings={novelSettings}
          pages={pages}
          setPageIndex={setPageIndex}
        />
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
  const { novel, chapter } = route.params;
  const webViewRef = useRef<WebView>(null);
  const readerSheetRef = useRef(null);
  const theme = useTheme();
  const { pageReader = false, keepScreenOn } = useChapterGeneralSettings();

  const {
    hidden,
    loading,
    error,
    prevChapter,
    nextChapter,
    chapterText,
    setError,
    setLoading,
    getChapter,
    setChapter,
    saveProgress,
    hideHeader,
  } = useChapter(novel, chapter, webViewRef);

  const scrollToStart = () =>
    requestAnimationFrame(() => {
      webViewRef?.current?.injectJavaScript(
        !pageReader
          ? `(()=>{
                window.scrollTo({top:0,behavior:'smooth'})
              })()`
          : `(()=>{
              document.querySelector('chapter').setAttribute('data-page',0);
              document.querySelector("chapter").style.transform = 'translate(0%)';
            })()`,
      );
    });

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
            ? getString('readerScreen.noNextChapter')
            : getString('readerScreen.noPreviousChapter'),
        );
  };

  const openDrawer = useCallback(() => {
    drawerRef.current?.openDrawer();
    hideHeader();
  }, [drawerRef, hideHeader]);

  if (loading) {
    return <ChapterLoadingScreen />;
  }

  if (error) {
    return (
      <ErrorScreenV2
        error={error}
        actions={[
          {
            iconName: 'refresh',
            title: getString('common.retry'),
            onPress: () => {
              setError('');
              setLoading(true);
              getChapter();
            },
          },
          {
            iconName: 'earth',
            title: 'WebView',
            onPress: () =>
              navigation.navigate('WebviewScreen', {
                name: novel.name,
                url: chapter.path,
                pluginId: novel.pluginId,
              }),
          },
        ]}
      />
    );
  }
  return (
    <>
      {keepScreenOn ? <KeepScreenAwake /> : null}
      <WebViewReader
        data={{ novel, chapter }}
        html={chapterText}
        nextChapter={nextChapter}
        webViewRef={webViewRef}
        pageReader={pageReader}
        saveProgress={saveProgress}
        onPress={hideHeader}
        navigateToChapterBySwipe={navigateToChapterBySwipe}
      />
      <ReaderBottomSheetV2 bottomSheetRef={readerSheetRef} />
      {!hidden ? (
        <>
          <ReaderAppbar
            novelName={novel.name}
            chapter={chapter}
            setChapter={setChapter}
            goBack={navigation.goBack}
            theme={theme}
          />
          <ReaderFooter
            theme={theme}
            chapter={chapter}
            novel={novel}
            nextChapter={nextChapter}
            prevChapter={prevChapter}
            readerSheetRef={readerSheetRef}
            scrollToStart={scrollToStart}
            navigateToChapterBySwipe={navigateToChapterBySwipe}
            navigation={navigation}
            openDrawer={openDrawer}
          />
        </>
      ) : null}
    </>
  );
};

export default Chapter;

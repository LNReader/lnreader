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
import * as Speech from 'expo-speech';

import VolumeButtonListener from '@native/volumeButtonListener';

import { useKeepAwake } from 'expo-keep-awake';

import {
  getNextChapter,
  getPrevChapter,
  markChapterRead,
  updateChapterProgress,
} from '@database/queries/ChapterQueries';
import { fetchChapter } from '@services/plugin/fetch';
import { showToast } from '@utils/showToast';
import {
  useChapterGeneralSettings,
  useLibrarySettings,
  useTheme,
  useTrackedNovel,
  useTracker,
  useNovel,
} from '@hooks/persisted';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import ReaderAppbar from './components/ReaderAppbar';
import ReaderFooter from './components/ReaderFooter';

import { insertHistory } from '@database/queries/HistoryQueries';
import WebViewReader from './components/WebViewReader';
import { useFullscreenMode } from '@hooks';
import ReaderBottomSheetV2 from './components/ReaderBottomSheet/ReaderBottomSheet';
import { defaultTo } from 'lodash-es';
import { sanitizeChapterText } from './utils/sanitizeChapterText';
import ChapterDrawer from './components/ChapterDrawer';
import ChapterLoadingScreen from './ChapterLoadingScreen/ChapterLoadingScreen';
import { ErrorScreenV2 } from '@components';
import { ChapterScreenProps } from '@navigators/types';
import { ChapterInfo } from '@database/types';
import WebView from 'react-native-webview';
import { getString } from '@strings/translations';
import FileManager from '@native/FileManager';
import { NOVEL_STORAGE } from '@utils/Storages';

const Chapter = ({ route, navigation }: ChapterScreenProps) => {
  const drawerRef = useRef<DrawerLayoutAndroid>(null);
  const { chapters, novelSettings, pages, setLastRead, setPageIndex } =
    useNovel(route.params.novel.path, route.params.novel.pluginId);
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
        setLastRead={setLastRead}
      />
    </DrawerLayoutAndroid>
  );
};

type ChapterContentProps = ChapterScreenProps & {
  drawerRef: React.RefObject<DrawerLayoutAndroid>;
  setLastRead: (chapter: ChapterInfo | undefined) => void;
};

export const ChapterContent = ({
  route,
  navigation,
  drawerRef,
  setLastRead,
}: ChapterContentProps) => {
  useKeepAwake();
  const { novel, chapter } = route.params;
  const webViewRef = useRef<WebView>(null);
  const readerSheetRef = useRef(null);

  const theme = useTheme();

  const {
    useVolumeButtons,
    autoScroll,
    autoScrollInterval,
    autoScrollOffset,
    // verticalSeekbar = true,
    removeExtraParagraphSpacing,
  } = useChapterGeneralSettings();
  const { incognitoMode } = useLibrarySettings();

  const { setImmersiveMode, showStatusAndNavBar } = useFullscreenMode();

  const [hidden, setHidden] = useState(true);

  const { tracker } = useTracker();
  const { trackedNovel, updateNovelProgess } = useTrackedNovel(novel.id);

  const [sourceChapter, setChapter] = useState({ ...chapter, chapterText: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
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
      Speech.stop();
    };
  }, [useVolumeButtons, chapter]);

  const onLayout = useCallback(() => {
    setTimeout(() => connectVolumeButton());
  }, []);

  const getChapter = async () => {
    try {
      const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${chapter.novelId}/${chapter.id}/index.html`;
      if (await FileManager.exists(filePath)) {
        sourceChapter.chapterText = FileManager.readFile(filePath);
      } else {
        await fetchChapter(novel.pluginId, chapter.path)
          .then(res => {
            sourceChapter.chapterText = res;
          })
          .catch(e => setError(e.message));
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
      setLastRead(chapter);
    }
  }, [chapter]);

  const scrollTo = useCallback(
    (offsetY: number) => {
      webViewRef.current?.injectJavaScript(`(()=>{
        window.scrollTo({top:${offsetY},behavior:'smooth',})
      })()`);
    },
    [webViewRef],
  );

  let scrollInterval: NodeJS.Timeout;
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
    if (tracker && trackedNovel && chapterNumber > trackedNovel.progress) {
      updateNovelProgess(tracker, chapterNumber);
    }
  };

  const saveProgress = useCallback(
    (percentage: number) => {
      if (!incognitoMode) {
        updateChapterProgress(chapter.id, percentage > 100 ? 100 : percentage);
      }

      if (!incognitoMode && percentage >= 97) {
        // a relative number
        markChapterRead(chapter.id);
        updateTracker();
      }
    },
    [chapter],
  );

  const hideHeader = () => {
    if (!hidden) {
      webViewRef.current?.injectJavaScript('toolWrapper.hide()');
      setImmersiveMode();
    } else {
      webViewRef.current?.injectJavaScript('toolWrapper.show()');
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
            ? getString('readerScreen.noNextChapter')
            : getString('readerScreen.noPreviousChapter'),
        );
  };

  const chapterText = useMemo(
    () =>
      sanitizeChapterText(sourceChapter.chapterText, {
        removeExtraParagraphSpacing,
      }),
    [sourceChapter.chapterText],
  );

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
      <WebViewReader
        data={{ novel, chapter }}
        html={chapterText}
        nextChapter={nextChapter}
        webViewRef={webViewRef}
        saveProgress={saveProgress}
        onLayout={() => {
          useVolumeButtons && onLayout();
        }}
        onPress={hideHeader}
        navigateToChapterBySwipe={navigateToChapterBySwipe}
      />
      <ReaderBottomSheetV2 bottomSheetRef={readerSheetRef} />
      {!hidden ? (
        <>
          <ReaderAppbar
            novelName={novel.name}
            chapter={sourceChapter}
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
            scrollTo={scrollTo}
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

import * as React from 'react';
import ChapterItem from './ChapterItem';
import NovelInfoHeader from './Info/NovelInfoHeader';
import { useRef, useState, useCallback, useMemo } from 'react';
import { ChapterInfo } from '@database/types';
import { UseBooleanReturnType } from '@hooks/index';
import {
  useAppSettings,
  useDownload,
  useNovelChapters,
  useNovelSettings,
  useNovelState,
} from '@hooks/persisted';
import {
  updateNovel,
  updateNovelPage,
} from '@services/updates/LibraryUpdateQueries';
import { getString } from '@strings/translations';
import { showToast } from '@utils/showToast';
import {
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackSheet from './Tracker/TrackSheet';
import NovelBottomSheet from './NovelBottomSheet';
import * as Haptics from 'expo-haptics';
import { AnimatedFAB } from 'react-native-paper';
import { ChapterListSkeleton } from '@components/Skeleton/Skeleton';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { FlashList } from '@shopify/flash-list';
import useNovelLastRead from '@hooks/persisted/novel/useNovelLastRead';
import { useTheme } from '@providers/Providers';

type NovelScreenListProps = {
  headerOpacity: SharedValue<number>;
  listRef: React.RefObject<FlashList<ChapterInfo> | null>;
  navigation: any;
  openDrawer: () => void;
  selected: ChapterInfo[];
  setSelected: React.Dispatch<React.SetStateAction<ChapterInfo[]>>;
  getNextChapterBatch: () => void;
  deleteDownloadsSnackbar: UseBooleanReturnType;
  routeBaseNovel: {
    name: string;
    path: string;
    pluginId: string;
    cover?: string;
  };
};

// Memoized empty component
const ListEmptyComponent = React.memo(() => <ChapterListSkeleton />);

const NovelScreenList = ({
  headerOpacity,
  listRef,
  navigation,
  openDrawer,
  routeBaseNovel,
  selected,
  deleteDownloadsSnackbar,
  setSelected,
  getNextChapterBatch,
}: NovelScreenListProps) => {
  const { getNovel, novel, loading } = useNovelState();
  const { chapters, deleteChapter, fetching, batchInformation } =
    useNovelChapters();
  const { novelSettings, sortAndFilterChapters, setShowChapterTitles } =
    useNovelSettings();
  const { lastRead } = useNovelLastRead();

  const { pluginId } = routeBaseNovel;

  const [updating, setUpdating] = useState(false);

  const {
    useFabForContinueReading,
    defaultChapterSort,
    disableHapticFeedback,
    downloadNewChapters,
    refreshNovelMetadata,
  } = useAppSettings();

  const {
    sort = defaultChapterSort,
    filter = '',
    showChapterTitles = false,
  } = novelSettings;

  const theme = useTheme();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();

  const { downloadQueue, downloadChapter } = useDownload();

  const [isFabExtended, setIsFabExtended] = useState(true);

  const novelBottomSheetRef = useRef<BottomSheetModalMethods>(null);
  const trackerSheetRef = useRef<BottomSheetModalMethods>(null);

  // Memoize selected chapter IDs for faster lookup
  const selectedIds = useMemo(
    () => new Set(selected.map(chapter => chapter.id)),
    [selected],
  );

  // Memoize the isSelected function
  const isSelected = useCallback(
    (id: number) => selectedIds.has(id),
    [selectedIds],
  );

  // Memoize download queue IDs for faster lookup
  const downloadingIds = useMemo(
    () => new Set(downloadQueue.map(c => c.task.data.chapterId)),
    [downloadQueue],
  );

  const onPageScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;

      headerOpacity.set(y < 50 ? 0 : (y - 50) / 150);
      const currentScrollPosition = Math.floor(y) ?? 0;
      if (useFabForContinueReading && lastRead) {
        setIsFabExtended(currentScrollPosition <= 0);
      }
    },
    [headerOpacity, useFabForContinueReading, lastRead],
  );

  const onRefresh = useCallback(async () => {
    if (novel.id !== 'NO_ID') {
      setUpdating(true);
      try {
        await updateNovel(pluginId, novel.path, novel.id, {
          downloadNewChapters,
          refreshNovelMetadata,
        });
        await getNovel();
        showToast(getString('novelScreen.updatedToast', { name: novel.name }));
      } catch (error: any) {
        showToast('Failed updating: ' + error.message);
      } finally {
        setUpdating(false);
      }
    }
  }, [
    novel.id,
    novel.path,
    novel.name,
    pluginId,
    downloadNewChapters,
    refreshNovelMetadata,
    getNovel,
  ]);

  const onRefreshPage = useCallback(
    async (page: string) => {
      if (novel.id !== 'NO_ID') {
        setUpdating(true);
        try {
          await updateNovelPage(pluginId, novel.path, novel.id, page, {
            downloadNewChapters,
          });
          await getNovel();
          showToast(`Updated page: ${page}`);
        } catch (e: any) {
          showToast('Failed updating: ' + e.message);
        } finally {
          setUpdating(false);
        }
      }
    },
    [novel.id, novel.path, pluginId, downloadNewChapters, getNovel],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        progressViewOffset={topInset + 32}
        onRefresh={onRefresh}
        refreshing={updating}
        colors={[theme.primary]}
        progressBackgroundColor={theme.onPrimary}
      />
    ),
    [topInset, onRefresh, updating, theme.primary, theme.onPrimary],
  );

  const navigateToChapter = useCallback(
    (chapter: ChapterInfo) => {
      navigation.navigate('ReaderStack', {
        screen: 'Chapter',
        params: { novel, chapter },
      });
    },
    [navigation, novel],
  );

  const onSelectPress = useCallback(
    (chapter: ChapterInfo) => {
      if (selected.length === 0) {
        navigateToChapter(chapter);
      } else {
        if (isSelected(chapter.id)) {
          setSelected(sel => sel.filter(it => it.id !== chapter.id));
        } else {
          setSelected(sel => [...sel, chapter]);
        }
      }
    },
    [selected.length, navigateToChapter, isSelected, setSelected],
  );

  const onSelectLongPress = useCallback(
    (chapter: ChapterInfo) => {
      if (selected.length === 0) {
        if (!disableHapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setSelected(sel => [...sel, chapter]);
      } else {
        if (selected.length === chapters.length) {
          return;
        }

        const lastSelectedChapter = selected[selected.length - 1];

        if (lastSelectedChapter.id !== chapter.id) {
          if (lastSelectedChapter.id > chapter.id) {
            setSelected(sel => [
              ...sel,
              chapter,
              ...chapters.filter(
                (chap: ChapterInfo) =>
                  (chap.id <= chapter.id ||
                    chap.id >= lastSelectedChapter.id) === false,
              ),
            ]);
          } else {
            setSelected(sel => [
              ...sel,
              chapter,
              ...chapters.filter(
                (chap: ChapterInfo) =>
                  (chap.id >= chapter.id ||
                    chap.id <= lastSelectedChapter.id) === false,
              ),
            ]);
          }
        }
      }
    },
    [selected, chapters, disableHapticFeedback, setSelected],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChapterInfo }) => {
      if (novel.id === 'NO_ID') {
        return null;
      }
      return (
        <ChapterItem
          isDownloading={downloadingIds.has(item.id)}
          isBookmarked={!!item.bookmark}
          isLocal={novel.isLocal}
          chapter={item}
          showChapterTitles={showChapterTitles}
          deleteChapter={() => deleteChapter(item)}
          downloadChapter={() => downloadChapter(novel, item)}
          isSelected={isSelected(item.id)}
          onSelectPress={onSelectPress}
          onSelectLongPress={onSelectLongPress}
          navigateToChapter={navigateToChapter}
          novelName={novel.name}
        />
      );
    },
    [
      novel,
      downloadingIds,
      showChapterTitles,
      isSelected,
      onSelectPress,
      onSelectLongPress,
      navigateToChapter,
      deleteChapter,
      downloadChapter,
    ],
  );

  const extraData = useMemo(
    () => ({
      chapters,
      selectedLength: selected.length,
      novelId: novel.id,
      loading,
      showChapterTitles,
      downloadingIds: Array.from(downloadingIds).sort().join(','), // Convert to string for stable comparison
    }),
    [
      chapters,
      selected.length,
      novel.id,
      loading,
      showChapterTitles,
      downloadingIds,
    ],
  );

  const keyExtractor = useCallback((item: ChapterInfo) => 'c' + item.id, []);

  // Memoize the FAB navigation function
  const navigateToFab = useCallback(() => {
    navigation.navigate('ReaderStack', {
      screen: 'Chapter',
      params: {
        novel: novel,
        chapter: lastRead ?? chapters[0],
      },
    });
  }, [navigation, novel, lastRead, chapters]);

  // Memoize the header component props
  const renderHeader = useMemo(() => {
    const props = {
      deleteDownloadsSnackbar,
      filter,
      lastRead,
      navigateToChapter,
      navigation,
      novelBottomSheetRef,
      onRefreshPage,
      openDrawer,
      totalChapters: batchInformation.totalChapters,
      trackerSheetRef,
    };
    return <NovelInfoHeader {...props} />;
  }, [
    deleteDownloadsSnackbar,
    filter,
    lastRead,
    navigateToChapter,
    navigation,
    onRefreshPage,
    openDrawer,
    batchInformation.totalChapters,
  ]);

  return (
    <>
      <FlashList
        ref={listRef}
        estimatedItemSize={64}
        data={chapters}
        extraData={extraData}
        ListFooterComponent={!fetching ? undefined : ListEmptyComponent}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.contentContainer}
        refreshControl={refreshControl}
        onEndReached={getNextChapterBatch}
        onEndReachedThreshold={6}
        onScroll={onPageScroll}
        drawDistance={400}
        ListHeaderComponent={renderHeader}
      />
      {novel.id !== 'NO_ID' && (
        <>
          <NovelBottomSheet
            bottomSheetRef={novelBottomSheetRef}
            sortAndFilterChapters={sortAndFilterChapters}
            setShowChapterTitles={setShowChapterTitles}
            sort={sort}
            theme={theme}
            filter={filter}
            showChapterTitles={showChapterTitles}
          />
          <TrackSheet
            bottomSheetRef={trackerSheetRef}
            novel={novel}
            theme={theme}
          />
          {useFabForContinueReading && (lastRead || chapters[0]) ? (
            <AnimatedFAB
              style={[
                styles.fab,
                { backgroundColor: theme.primary, marginBottom: bottomInset },
              ]}
              extended={isFabExtended && !loading}
              color={theme.onPrimary}
              uppercase={false}
              label={
                lastRead
                  ? getString('common.resume')
                  : getString('novelScreen.startReadingChapters', {
                      name: '',
                    }).trim()
              }
              icon="play"
              onPress={navigateToFab}
            />
          ) : null}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 100 },
  fab: {
    bottom: 16,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default React.memo(NovelScreenList);

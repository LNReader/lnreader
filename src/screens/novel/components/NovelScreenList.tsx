import * as React from 'react';
import ChapterItem from './ChapterItem';
import NovelInfoHeader from './Info/NovelInfoHeader';
import { useRef, useState, useCallback, useMemo } from 'react';
import { pickCustomNovelCover } from '@database/queries/NovelQueries';
import { ChapterInfo, NovelInfo } from '@database/types';
import { useBoolean } from '@hooks/index';
import { useAppSettings, useDownload, useTheme } from '@hooks/persisted';
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
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useNovelContext } from '../NovelProvider';
import FileManager from '@specs/NativeFile';
import { downloadFile } from '@plugins/helpers/fetch';
import { StorageAccessFramework } from 'expo-file-system/legacy';

type NovelScreenListProps = {
  headerOpacity: SharedValue<number>;
  listRef: React.RefObject<FlashListRef<ChapterInfo> | null>;
  navigation: any;
  openDrawer: () => void;
  selected: ChapterInfo[];
  setSelected: React.Dispatch<React.SetStateAction<ChapterInfo[]>>;
  getNextChapterBatch: () => void;
  routeBaseNovel: {
    name: string;
    path: string;
    pluginId: string;
    cover?: string;
  };
};

// Memoized empty component
const ListEmptyComponent = React.memo(() => <ChapterListSkeleton />);

// Memoized header component
const MemoizedNovelInfoHeader = React.memo(NovelInfoHeader);

const NovelScreenList = ({
  headerOpacity,
  listRef,
  navigation,
  openDrawer,
  routeBaseNovel,
  selected,
  setSelected,
  getNextChapterBatch,
}: NovelScreenListProps) => {
  const {
    chapters,
    deleteChapter,
    fetching,
    getNovel,
    lastRead,
    loading,
    novelSettings,
    pages,
    setNovel,
    sortAndFilterChapters,
    setShowChapterTitles,
    updateChapter,
    novel: fetchedNovel,
    batchInformation,
    pageIndex,
  } = useNovelContext();

  const { pluginId } = routeBaseNovel;

  // Memoize route novel to prevent recreation on every render
  const routeNovel: Omit<NovelInfo, 'id'> & { id: 'NO_ID' } = useMemo(
    () => ({
      inLibrary: false,
      isLocal: false,
      totalPages: 0,
      ...routeBaseNovel,
      id: 'NO_ID',
    }),
    [routeBaseNovel],
  );

  const novel = fetchedNovel ?? routeNovel;
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

  const deleteDownloadsSnackbar = useBoolean();

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

  const setCustomNovelCover = useCallback(async () => {
    if (!novel || novel.id === 'NO_ID') {
      return;
    }
    const newCover = await pickCustomNovelCover(novel);
    if (newCover) {
      setNovel({
        ...novel,
        cover: newCover,
      });
    }
  }, [novel, setNovel]);

  const saveNovelCover = useCallback(async () => {
    if (!novel) {
      showToast(getString('novelScreen.coverNotSaved'));
      return;
    }
    if (!novel.cover) {
      showToast(getString('novelScreen.noCoverFound'));
      return;
    }
    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
      showToast(getString('novelScreen.coverNotSaved'));
      return;
    }
    const cover = novel.cover;
    let tempCoverUri: string | null = null;
    try {
      let imageExtension = cover.split('.').pop() || 'png';
      if (imageExtension.includes('?')) {
        imageExtension = imageExtension.split('?')[0] || 'png';
      }
      imageExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(
        imageExtension || '',
      )
        ? imageExtension
        : 'png';

      const novelName = novel.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${novelName}_${novel.id}.${imageExtension}`;
      const coverDestUri = await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        'image/' + imageExtension,
      );
      if (cover.startsWith('http')) {
        const { ExternalCachesDirectoryPath } = FileManager.getConstants();
        tempCoverUri = ExternalCachesDirectoryPath + '/' + fileName;
        await downloadFile(cover, tempCoverUri);
        FileManager.copyFile(tempCoverUri, coverDestUri);
      } else {
        FileManager.copyFile(cover, coverDestUri);
      }
      showToast(getString('novelScreen.coverSaved'));
    } catch (err: any) {
      showToast(err.message);
    } finally {
      if (tempCoverUri) {
        FileManager.unlink(tempCoverUri);
      }
    }
  }, [novel]);

  // Memoize the renderItem function
  const renderItem = useCallback(
    ({ item, index }: { item: ChapterInfo; index: number }) => {
      if (novel.id === 'NO_ID') {
        return null;
      }
      return (
        <ChapterItem
          isDownloading={downloadingIds.has(item.id)}
          isBookmarked={!!item.bookmark}
          isLocal={novel.isLocal}
          theme={theme}
          chapter={item}
          showChapterTitles={showChapterTitles}
          deleteChapter={() => deleteChapter(item)}
          downloadChapter={() => downloadChapter(novel, item)}
          isSelected={isSelected(item.id)}
          onSelectPress={onSelectPress}
          onSelectLongPress={onSelectLongPress}
          navigateToChapter={navigateToChapter}
          novelName={novel.name}
          setChapterDownloaded={(value: boolean) =>
            updateChapter?.(index, { isDownloaded: value })
          }
        />
      );
    },
    [
      novel,
      downloadingIds,
      theme,
      showChapterTitles,
      isSelected,
      onSelectPress,
      onSelectLongPress,
      navigateToChapter,
      deleteChapter,
      downloadChapter,
      updateChapter,
    ],
  );

  // Optimize extraData to only include what actually affects rendering
  const extraData = useMemo(
    () => ({
      chaptersLength: chapters.length,
      selectedLength: selected.length,
      novelId: novel.id,
      loading,
      downloadingIds: Array.from(downloadingIds).sort().join(','), // Convert to string for stable comparison
    }),
    [chapters.length, selected.length, novel.id, loading, downloadingIds],
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
      chapters,
      deleteDownloadsSnackbar,
      fetching,
      filter,
      isLoading: loading,
      lastRead,
      navigateToChapter,
      navigation,
      novel,
      novelBottomSheetRef,
      onRefreshPage,
      openDrawer,
      page: pages.length > 1 ? pages[pageIndex] : undefined,
      setCustomNovelCover,
      saveNovelCover,
      theme,
      totalChapters: batchInformation.totalChapters,
      trackerSheetRef,
    };
    return <MemoizedNovelInfoHeader {...props} />;
  }, [
    chapters,
    deleteDownloadsSnackbar,
    fetching,
    filter,
    loading,
    lastRead,
    navigateToChapter,
    navigation,
    novel,
    onRefreshPage,
    openDrawer,
    pages,
    pageIndex,
    setCustomNovelCover,
    saveNovelCover,
    theme,
    batchInformation.totalChapters,
  ]);

  return (
    <>
      <FlashList
        ref={listRef}
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
        drawDistance={1000}
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

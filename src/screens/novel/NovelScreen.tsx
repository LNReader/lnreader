import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  RefreshControl,
  StatusBar,
  Share,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import {
  Provider,
  Portal,
  Appbar,
  IconButton,
  Menu,
  Snackbar,
  AnimatedFAB,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { showToast } from '../../utils/showToast';
import {
  useAppSettings,
  useDownload,
  useNovel,
  useTheme,
} from '@hooks/persisted';
import NovelInfoHeader from './components/Info/NovelInfoHeader';
import NovelBottomSheet from './components/NovelBottomSheet';
import TrackSheet from './components/Tracker/TrackSheet';
import { Row } from '../../components/Common';
import JumpToChapterModal from './components/JumpToChapterModal';
import { Actionbar } from '../../components/Actionbar/Actionbar';
import EditInfoModal from './components/EditInfoModal';
import { pickCustomNovelCover } from '../../database/queries/NovelQueries';
import DownloadCustomChapterModal from './components/DownloadCustomChapterModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBoolean } from '@hooks';
import NovelScreenLoading from './components/LoadingAnimation/NovelScreenLoading';
import { NovelScreenProps } from '@navigators/types';
import { ChapterInfo } from '@database/types';
import ChapterItem from './components/ChapterItem';

const Novel = ({ route, navigation }: NovelScreenProps) => {
  const { name, url, pluginId } = route.params;
  const [updating, setUpdating] = useState(false);
  const {
    progress,
    novel,
    chapters,
    lastRead,
    novelSettings,
    setNovel,
    getNovel,
    sortAndFilterChapters,
    setShowChapterTitles,
    updateNovel,
    bookmarkChapters,
    markChaptersRead,
    markChaptersUnread,
    markPreviouschaptersRead,
    markPreviousChaptersUnread,
    followNovel,
    deleteChapter,
    refreshChapters,
    deleteChapters,
  } = useNovel(url, pluginId);

  const [loading, setLoading] = useState(!novel);

  const theme = useTheme();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const progressViewOffset = topInset + 32;

  const {
    queue: downloadQueue,
    downloadChapter,
    downloadChapters,
  } = useDownload();

  const [selected, setSelected] = useState<ChapterInfo[]>([]);
  const [downloadMenu, showDownloadMenu] = useState(false);
  const [extraMenu, showExtraMenu] = useState(false);
  const [editInfoModal, showEditInfoModal] = useState(false);
  const [isFabExtended, setIsFabExtended] = useState(true);

  let flatlistRef = useRef<FlashList<ChapterInfo>>(null);
  let novelBottomSheetRef = useRef(null);
  let trackerSheetRef = useRef(null);

  const deleteDownloadsSnackbar = useBoolean();

  const {
    useFabForContinueReading,
    defaultChapterSort,
    disableHapticFeedback,
  } = useAppSettings();

  const {
    sort = defaultChapterSort,
    filter = '',
    showChapterTitles = false,
  } = novelSettings;

  const onPageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const currentScrollPosition = Math.floor(y) ?? 0;
    setIsFabExtended(currentScrollPosition <= 0);
  };

  useEffect(() => {
    getNovel().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refreshChapters();
  }, [downloadQueue]);

  const onRefresh = () => {
    setUpdating(true);
    updateNovel()
      .then(() => showToast(`Updated ${name}`))
      .finally(() => setUpdating(false));
  };

  const refreshControl = () => (
    <RefreshControl
      progressViewOffset={progressViewOffset}
      onRefresh={onRefresh}
      refreshing={updating}
      colors={[theme.primary]}
      progressBackgroundColor={theme.onPrimary}
    />
  );

  const [jumpToChapterModal, showJumpToChapterModal] = useState(false);
  const downloadCustomChapterModal = useBoolean();

  const actions = useMemo(() => {
    const list = [];

    if (selected.some(obj => !obj.isDownloaded)) {
      list.push({
        icon: 'download-outline',
        onPress: () => {
          if (novel) {
            downloadChapters(novel, selected);
          }
          setSelected([]);
        },
      });
    }
    if (selected.some(obj => obj.isDownloaded)) {
      list.push({
        icon: 'trash-can-outline',
        onPress: () => {
          // dispatch(deleteAllChaptersAction(pluginId, novel.id, selected));
          setSelected([]);
        },
      });
    }

    list.push({
      icon: 'bookmark-outline',
      onPress: () => {
        bookmarkChapters(selected);
        setSelected([]);
      },
    });

    if (selected.some(obj => obj.unread)) {
      list.push({
        icon: 'check',
        onPress: () => {
          markChaptersRead(selected);
          setSelected([]);
        },
      });
    }

    if (selected.some(obj => !obj.unread)) {
      list.push({
        icon: 'check-outline',
        onPress: () => {
          markChaptersUnread(selected);
          setSelected([]);
        },
      });
    }

    if (selected.length === 1) {
      if (selected[0].unread) {
        list.push({
          icon: 'playlist-check',
          onPress: () => {
            markPreviouschaptersRead(selected[0].id);
            setSelected([]);
          },
        });
      } else {
        list.push({
          icon: 'playlist-remove',
          onPress: () => {
            markPreviousChaptersUnread(selected[0].id);
            setSelected([]);
          },
        });
      }
    }

    return list;
  }, [selected]);

  const isSelected = (id: number) => {
    return selected.some(obj => obj.id === id);
  };

  const onSelectPress = (chapter: ChapterInfo) => {
    if (selected.length === 0) {
      navigateToChapter(chapter);
    } else {
      if (isSelected(chapter.id)) {
        setSelected(sel => sel.filter(it => it.id !== chapter.id));
      } else {
        setSelected(sel => [...sel, chapter]);
      }
    }
  };

  const onSelectLongPress = (chapter: ChapterInfo) => {
    if (selected.length === 0) {
      if (!disableHapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setSelected(sel => [...sel, chapter]);
    } else {
      if (selected.length === chapters.length) {
        return;
      }

      /**
       * Select custom range
       */
      const lastSelectedChapter = selected[selected.length - 1];

      if (lastSelectedChapter.id !== chapter.id) {
        if (lastSelectedChapter.id > chapter.id) {
          setSelected(sel => [
            ...sel,
            chapter,
            ...chapters.filter(
              (chap: ChapterInfo) =>
                (chap.id <= chapter.id || chap.id >= lastSelectedChapter.id) ===
                false,
            ),
          ]);
        } else {
          setSelected(sel => [
            ...sel,
            chapter,
            ...chapters.filter(
              (chap: ChapterInfo) =>
                (chap.id >= chapter.id || chap.id <= lastSelectedChapter.id) ===
                false,
            ),
          ]);
        }
      }
    }
  };
  if (loading) {
    return <NovelScreenLoading theme={theme} />;
  }
  if (!novel) {
    return null;
  }
  const navigateToChapter = (chapter: ChapterInfo) => {
    navigation.navigate('Chapter', { novel, chapter });
  };

  const showProgressPercentage = (chapter: ChapterInfo) => {
    const savedProgress =
      progress && progress[chapter.id] && progress[chapter.id].percentage;
    if (
      savedProgress &&
      savedProgress < 97 &&
      savedProgress > 0 &&
      chapter.unread
    ) {
      return (
        <Text
          style={{
            color: theme.outline,
            fontSize: 12,
            marginLeft: chapter.releaseTime ? 5 : 0,
          }}
          numberOfLines={1}
        >
          {chapter.releaseTime ? '•  ' : null}
          {'Progress ' + savedProgress + '%'}
        </Text>
      );
    }
  };

  const setCustomNovelCover = async () => {
    showExtraMenu(false);
    const newCover = await pickCustomNovelCover(novel);
    if (newCover) {
      setNovel({
        ...novel,
        cover: newCover,
      });
    }
  };

  return (
    <Provider>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Portal>
          {selected.length === 0 ? (
            <View
              style={{
                position: 'absolute',
                height: (StatusBar.currentHeight || 0) + 54,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <IconButton
                icon="arrow-left"
                iconColor={theme.onBackground}
                size={24}
                style={{ marginTop: (StatusBar.currentHeight || 0) + 8 }}
                onPress={() => navigation.goBack()}
              />
              <Row>
                <IconButton
                  icon="share-variant"
                  iconColor={theme.onBackground}
                  size={21}
                  style={{
                    marginTop: (StatusBar.currentHeight || 0) + 8,
                  }}
                  onPress={() =>
                    Share.share({
                      message: novel.url,
                    })
                  }
                />
                <IconButton
                  icon="text-box-search-outline"
                  iconColor={theme.onBackground}
                  size={21}
                  style={{
                    marginTop: (StatusBar.currentHeight || 0) + 8,
                  }}
                  onPress={() => showJumpToChapterModal(true)}
                />
                {!novel.isLocal && (
                  <Menu
                    visible={downloadMenu}
                    onDismiss={() => showDownloadMenu(false)}
                    anchor={
                      <IconButton
                        icon="download-outline"
                        iconColor={theme.onBackground}
                        size={24}
                        style={{
                          marginTop: (StatusBar.currentHeight || 0) + 8,
                        }}
                        onPress={() => showDownloadMenu(true)}
                      />
                    }
                    contentStyle={{ backgroundColor: theme.surface2 }}
                  >
                    <Menu.Item
                      title="Next chapter"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{ color: theme.onSurface }}
                      onPress={() => {
                        showDownloadMenu(false);
                        const finded = chapters.find(
                          chapter => chapter.unread && !chapter.isDownloaded,
                        );
                        if (novel && finded) {
                          downloadChapter(novel, finded);
                        }
                      }}
                    />
                    <Menu.Item
                      title="Next 5 chapter"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{
                        color: theme.onSurface,
                      }}
                      onPress={() => {
                        showDownloadMenu(false);
                        if (novel) {
                          downloadChapters(
                            novel,
                            chapters
                              .filter(
                                chapter =>
                                  chapter.unread && !chapter.isDownloaded,
                              )
                              .slice(0, 5),
                          );
                        }
                      }}
                    />
                    <Menu.Item
                      title="Next 10 chapter"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{
                        color: theme.onSurface,
                      }}
                      onPress={() => {
                        showDownloadMenu(false);
                        if (novel) {
                          downloadChapters(
                            novel,
                            chapters
                              .filter(
                                chapter =>
                                  chapter.unread && !chapter.isDownloaded,
                              )
                              .slice(0, 10),
                          );
                        }
                      }}
                    />
                    <Menu.Item
                      title="Custom"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{ color: theme.onSurface }}
                      onPress={() => {
                        downloadCustomChapterModal.setTrue();
                        showDownloadMenu(false);
                      }}
                    />
                    <Menu.Item
                      title="Unread"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{
                        color: theme.onSurface,
                      }}
                      onPress={() => {
                        showDownloadMenu(false);
                        if (novel) {
                          downloadChapters(
                            novel,
                            chapters.filter(chapter => chapter.unread),
                          );
                        }
                      }}
                    />
                    <Menu.Item
                      title="All"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{
                        color: theme.onSurface,
                      }}
                      onPress={() => {
                        if (novel) {
                          downloadChapters(novel, chapters);
                        }
                        showDownloadMenu(false);
                      }}
                    />
                    <Menu.Item
                      title="Delete downloads"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{
                        color: theme.onSurface,
                      }}
                      onPress={() => {
                        showDownloadMenu(false);
                        deleteChapters(chapters.filter(c => c.isDownloaded));
                      }}
                    />
                  </Menu>
                )}

                <Menu
                  visible={extraMenu}
                  onDismiss={() => showExtraMenu(false)}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      iconColor={theme.onBackground}
                      size={21}
                      style={{
                        marginTop: (StatusBar.currentHeight || 0) + 8,
                        marginRight: 16,
                      }}
                      onPress={() => showExtraMenu(true)}
                    />
                  }
                  contentStyle={{
                    backgroundColor: theme.surface2,
                  }}
                >
                  <Menu.Item
                    title="Edit info"
                    style={{ backgroundColor: theme.surface2 }}
                    titleStyle={{
                      color: theme.onSurface,
                    }}
                    onPress={() => {
                      showEditInfoModal(true);
                      showExtraMenu(false);
                    }}
                  />
                  <Menu.Item
                    title="Edit cover"
                    style={{ backgroundColor: theme.surface2 }}
                    titleStyle={{
                      color: theme.onSurface,
                    }}
                    onPress={setCustomNovelCover}
                  />
                </Menu>
              </Row>
            </View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(150)}
              style={{
                position: 'absolute',
                width: '100%',
                elevation: 2,
                backgroundColor: theme.surface2,
                paddingTop: StatusBar.currentHeight || 0,
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: 8,
              }}
            >
              <Appbar.Action
                icon="close"
                iconColor={theme.onBackground}
                onPress={() => setSelected([])}
              />
              <Appbar.Content
                title={`${selected.length}`}
                titleStyle={{ color: theme.onSurface }}
              />
              <Appbar.Action
                icon="select-all"
                iconColor={theme.onBackground}
                onPress={() => {
                  setSelected(chapters);
                }}
              />
            </Animated.View>
          )}
        </Portal>
        <View style={{ minHeight: 3, flex: 1 }}>
          <FlashList
            ref={flatlistRef}
            estimatedItemSize={64}
            data={chapters}
            extraData={[chapters]}
            removeClippedSubviews={true}
            renderItem={({ item }) => (
              <ChapterItem
                isDownloading={downloadQueue.some(
                  c => c.chapter.id === item.id,
                )}
                isLocal={novel.isLocal}
                theme={theme}
                chapter={item}
                showChapterTitles={showChapterTitles}
                deleteChapter={() => deleteChapter(item)}
                downloadChapter={() => downloadChapter(novel, item)}
                isSelected={isSelected}
                onSelectPress={onSelectPress}
                onSelectLongPress={onSelectLongPress}
                navigateToChapter={navigateToChapter}
                showProgressPercentage={showProgressPercentage}
                novelName={name}
              />
            )}
            keyExtractor={(item, index) => 'chapter' + item.id + index}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListHeaderComponent={
              <NovelInfoHeader
                novel={novel}
                theme={theme}
                filter={filter}
                lastRead={lastRead}
                setCustomNovelCover={setCustomNovelCover}
                chapters={chapters}
                navigation={navigation}
                navigateToChapter={navigateToChapter}
                followNovel={followNovel}
                trackerSheetRef={trackerSheetRef}
                novelBottomSheetRef={novelBottomSheetRef}
                deleteDownloadsSnackbar={deleteDownloadsSnackbar}
              />
            }
            refreshControl={refreshControl()}
            onScroll={onPageScroll}
          />
        </View>
        {useFabForContinueReading && lastRead && (
          <AnimatedFAB
            style={[
              styles.fab,
              { backgroundColor: theme.primary, marginBottom: bottomInset },
            ]}
            extended={isFabExtended}
            color={theme.onPrimary}
            uppercase={false}
            label="Resume"
            icon="play"
            onPress={() => {
              if (lastRead) {
                navigation.navigate('Chapter', {
                  novel: novel,
                  chapter: lastRead,
                });
              }
            }}
          />
        )}
        <Portal>
          <Actionbar active={selected.length > 0} actions={actions} />
          <Snackbar
            visible={deleteDownloadsSnackbar.value}
            onDismiss={deleteDownloadsSnackbar.setFalse}
            action={{
              label: 'Delete',
              onPress: () => {
                deleteChapters(chapters.filter(c => c.isDownloaded));
              },
            }}
            theme={{ colors: { primary: theme.primary } }}
            style={{ backgroundColor: theme.surface, marginBottom: 32 }}
          >
            <Text style={{ color: theme.onSurface }}>
              Delete downloaded chapters?
            </Text>
          </Snackbar>
        </Portal>
        <Portal>
          <JumpToChapterModal
            modalVisible={jumpToChapterModal}
            hideModal={() => showJumpToChapterModal(false)}
            chapters={chapters}
            novel={novel}
            chapterListRef={flatlistRef.current}
            navigation={navigation}
          />
          <EditInfoModal
            modalVisible={editInfoModal}
            hideModal={() => showEditInfoModal(false)}
            novel={novel}
            setNovel={setNovel}
            theme={theme}
          />
          <DownloadCustomChapterModal
            modalVisible={downloadCustomChapterModal.value}
            hideModal={downloadCustomChapterModal.setFalse}
            novel={novel}
            chapters={chapters}
            theme={theme}
            downloadChapters={downloadChapters}
          />
        </Portal>
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
          novelId={novel.id}
          novelName={novel.name}
          theme={theme}
        />
      </View>
    </Provider>
  );
};

export default Novel;

const styles = StyleSheet.create({
  container: { flex: 1 },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
  },
});

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  RefreshControl,
  StatusBar,
  Share,
  Text,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import {
  Provider,
  Portal,
  Appbar,
  IconButton,
  Menu,
  FAB,
  Snackbar,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';

import {
  bookmarkChapterAction,
  deleteAllChaptersAction,
  deleteChapterAction,
  downloadAllChaptersAction,
  downloadChapterAction,
  getNovelAction,
  markChaptersRead,
  markChapterUnreadAction,
  markPreviousChaptersReadAction,
  setNovel,
  sortAndFilterChapters,
  updateNovelAction,
} from '@redux/novel/novel.actions';
import {
  useContinueReading,
  useNovel,
  usePreferences,
  useSettings,
} from '@hooks/reduxHooks';
import { showToast } from '../../hooks/showToast';
import { useTheme } from '@hooks/useTheme';
import ChapterItem from './components/ChapterItem';
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
import useBoolean from '@hooks/useBoolean';
import { useCategorySettings } from '@hooks/useSettings';
import { openChapter } from '../../utils/handleNavigateParams';
import NovelScreenLoading from './components/LoadingAnimation/NovelScreenLoading';

const Novel = ({ route, navigation }) => {
  const { name, url, pluginId } = route.params;
  const theme = useTheme();
  const dispatch = useDispatch();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const progressViewOffset = topInset + 32;

  const { novel, chapters, loading, updating } = useNovel();

  const { downloadQueue } = useSelector(state => state.downloadsReducer);

  const [selected, setSelected] = useState([]);
  const [downloadMenu, showDownloadMenu] = useState(false);
  const [extraMenu, showExtraMenu] = useState(false);

  let flatlistRef = useRef(null);
  let novelBottomSheetRef = useRef(null);
  let trackerSheetRef = useRef(null);

  const deleteDownloadsSnackbar = useBoolean();

  const {
    useFabForContinueReading,
    defaultChapterSort,
    disableHapticFeedback,
  } = useSettings();

  const {
    sort = defaultChapterSort,
    filter = '',
    showChapterTitles = false,
  } = usePreferences(novel.id);

  let { lastReadChapter, position } = useContinueReading(chapters, novel.id);
  useEffect(() => {
    dispatch(getNovelAction(pluginId, url, sort, filter));
  }, [getNovelAction]);

  const onRefresh = () => {
    dispatch(updateNovelAction(pluginId, url, novel.id, sort, filter));
    showToast(`Updated ${name}`);
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

  const downloadChapter = chapter =>
    dispatch(
      downloadChapterAction(
        pluginId,
        novel.id,
        chapter.url,
        chapter.name,
        chapter.id,
      ),
    );

  const actions = useMemo(() => {
    const list = [];

    if (selected.some(obj => obj.isDownloaded === 0)) {
      list.push({
        icon: 'download-outline',
        onPress: () => {
          dispatch(
            downloadAllChaptersAction(novel.pluginId, novel.url, selected),
          );
          setSelected([]);
        },
      });
    }
    if (selected.some(obj => obj.isDownloaded === 1)) {
      list.push({
        icon: 'trash-can-outline',
        onPress: () => {
          dispatch(deleteAllChaptersAction(pluginId, novel.id, selected));
          setSelected([]);
        },
      });
    }

    list.push({
      icon: 'bookmark-outline',
      onPress: () => {
        dispatch(bookmarkChapterAction(selected));
        setSelected([]);
      },
    });

    if (selected.some(obj => obj.unread === 0)) {
      list.push({
        icon: 'check',
        onPress: () => {
          dispatch(markChaptersRead(selected, novel.id, sort, filter));
          setSelected([]);
        },
      });
    }

    if (selected.some(obj => obj.unread === 1)) {
      list.push({
        icon: 'check-outline',
        onPress: () => {
          dispatch(markChapterUnreadAction(selected, novel.id, sort, filter));
          setSelected([]);
        },
      });
    }

    if (selected.length === 1) {
      list.push({
        icon: 'playlist-check',
        onPress: () => {
          dispatch(
            markPreviousChaptersReadAction(selected[0].id, selected[0].novelId),
          );
          setSelected([]);
        },
      });
    }

    return list;
  }, [selected]);

  const deleteChapter = chapter =>
    dispatch(deleteChapterAction(pluginId, novel.id, chapter.id, chapter.name));

  const isSelected = id => {
    return selected.some(obj => obj.id === id);
  };

  const onSelectPress = (chapter, navigateToChapter) => {
    if (selected.length === 0) {
      navigateToChapter();
    } else {
      if (isSelected(chapter.id)) {
        setSelected(sel => sel.filter(it => it.id !== chapter.id));
      } else {
        setSelected(sel => [...sel, chapter]);
      }
    }
  };

  const onSelectLongPress = chapter => {
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
              chap =>
                (chap.id <= chapter.id || chap.id >= lastSelectedChapter.id) ===
                false,
            ),
          ]);
        } else {
          setSelected(sel => [
            ...sel,
            chapter,
            ...chapters.filter(
              chap =>
                (chap.id >= chapter.id || chap.id <= lastSelectedChapter.id) ===
                false,
            ),
          ]);
        }
      }
    }
  };
  const navigateToChapter = chapter => {
    navigation.navigate('Chapter', { novel: novel, chapter: chapter });
  };

  const showProgressPercentage = chapter => {
    const savedProgress =
      position && position[chapter.id] && position[chapter.id].percentage;
    if (savedProgress < 97 && savedProgress > 0 && chapter.unread) {
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
    const newCover = await pickCustomNovelCover(novel.id);

    if (newCover) {
      dispatch(
        setNovel({
          ...novel,
          cover: newCover,
        }),
      );
    }

    showExtraMenu(false);
  };

  const renderItem = ({ item: it, index }) => (
    <ChapterItem
      isLocal={novel.isLocal}
      theme={theme}
      chapter={it}
      showChapterTitles={showChapterTitles}
      downloadQueue={downloadQueue}
      deleteChapter={deleteChapter}
      downloadChapter={downloadChapter}
      isSelected={isSelected}
      onSelectPress={onSelectPress}
      onSelectLongPress={onSelectLongPress}
      navigateToChapter={navigateToChapter}
      showProgressPercentage={showProgressPercentage}
      novelName={name}
    />
  );

  const [editInfoModal, showEditInfoModal] = useState(false);
  const downloadCustomChapterModal = useBoolean();

  if (loading) {
    return <NovelScreenLoading theme={theme} />;
  }
  return (
    <Provider>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Portal>
          {selected.length === 0 ? (
            <View
              style={{
                position: 'absolute',
                height: StatusBar.currentHeight + 54,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <IconButton
                icon="arrow-left"
                iconColor={theme.onBackground}
                size={24}
                style={{ marginTop: StatusBar.currentHeight + 8 }}
                onPress={() => navigation.goBack()}
              />
              <Row>
                <IconButton
                  icon="share-variant"
                  iconColor={theme.onBackground}
                  size={21}
                  style={{
                    marginTop: StatusBar.currentHeight + 8,
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
                    marginTop: StatusBar.currentHeight + 8,
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
                          marginTop: StatusBar.currentHeight + 8,
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
                        dispatch(
                          downloadAllChaptersAction(novel.pluginId, novel.url, [
                            chapters.find(
                              chapter =>
                                !!chapter.unread === true &&
                                !!chapter.isDownloaded === false,
                            ),
                          ]),
                        );
                        showDownloadMenu(false);
                      }}
                    />
                    <Menu.Item
                      title="Next 5 chapter"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{
                        color: theme.onSurface,
                      }}
                      onPress={() => {
                        dispatch(
                          downloadAllChaptersAction(
                            novel.pluginId,
                            novel.url,
                            chapters
                              .filter(
                                chapter =>
                                  !!chapter.unread === true &&
                                  !!chapter.idDownloaded === false,
                              )
                              .slice(0, 5),
                          ),
                        );
                        showDownloadMenu(false);
                      }}
                    />
                    <Menu.Item
                      title="Next 10 chapter"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{
                        color: theme.onSurface,
                      }}
                      onPress={() => {
                        dispatch(
                          downloadAllChaptersAction(
                            novel.pluginId,
                            novel.url,
                            chapters
                              .filter(
                                chapter =>
                                  !!chapter.unread === true &&
                                  !!chapter.Downloaded === false,
                              )
                              .slice(0, 10),
                          ),
                        );
                        showDownloadMenu(false);
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
                        dispatch(
                          downloadAllChaptersAction(
                            novel.pluginId,
                            novel.url,
                            chapters.filter(
                              chapter => !!chapter.unread === true,
                            ),
                          ),
                        );
                        showDownloadMenu(false);
                      }}
                    />
                    <Menu.Item
                      title="All"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{
                        color: theme.onSurface,
                      }}
                      onPress={() => {
                        dispatch(
                          downloadAllChaptersAction(
                            novel.pluginId,
                            novel.url,
                            chapters,
                          ),
                        );
                        showDownloadMenu(false);
                      }}
                    />
                    <Menu.Item
                      title="Delete downloads"
                      style={{ backgroundColor: theme.surface2 }}
                      titleStyle={{
                        color: theme.onSurface,
                      }}
                      onPress={() =>
                        dispatch(deleteAllChaptersAction(pluginId, chapters))
                      }
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
                        marginTop: StatusBar.currentHeight + 8,
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
                paddingTop: StatusBar.currentHeight,
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
            extraData={[downloadQueue, selected]}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={15}
            initialNumToRender={7}
            renderItem={renderItem}
            keyExtractor={(item, index) => 'chapter' + item.id + index}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListHeaderComponent={
              <NovelInfoHeader
                novel={novel}
                theme={theme}
                filter={filter}
                lastRead={lastReadChapter}
                setCustomNovelCover={setCustomNovelCover}
                dispatch={dispatch}
                chapters={chapters}
                navigation={navigation}
                trackerSheetRef={trackerSheetRef}
                novelBottomSheetRef={novelBottomSheetRef}
                deleteDownloadsSnackbar={deleteDownloadsSnackbar}
              />
            }
            refreshControl={refreshControl()}
          />
        </View>
        {useFabForContinueReading &&
          chapters?.length > 0 &&
          lastReadChapter && (
            <FAB
              style={[
                styles.fab,
                { backgroundColor: theme.primary, marginBottom: bottomInset },
              ]}
              small
              color={theme.onPrimary}
              uppercase={false}
              label={novel.unread ? 'Start' : 'Resume'}
              icon="play"
              onPress={() => {
                navigation.navigate(
                  'Chapter',
                  openChapter(novel, lastReadChapter),
                );
              }}
            />
          )}
        <Portal>
          <Actionbar
            active={selected.length > 0}
            theme={theme}
            style={{ marginBottom: 24 }}
            actions={actions}
          />
          <Snackbar
            visible={deleteDownloadsSnackbar.value}
            onDismiss={deleteDownloadsSnackbar.setFalse}
            action={{
              label: 'Delete',
              onPress: () => {
                dispatch(deleteAllChaptersAction(pluginId, novel.id, chapters));
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
            theme={theme}
            dispatch={dispatch}
          />
          <DownloadCustomChapterModal
            modalVisible={downloadCustomChapterModal.value}
            hideModal={downloadCustomChapterModal.setFalse}
            novel={novel}
            chapters={chapters}
            theme={theme}
            dispatch={dispatch}
          />
        </Portal>
        <NovelBottomSheet
          bottomSheetRef={novelBottomSheetRef}
          dispatch={dispatch}
          sortAndFilterChapters={sortAndFilterChapters}
          novelId={novel.id}
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

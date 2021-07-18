import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    RefreshControl,
    StatusBar,
    Dimensions,
    Share,
    Text,
} from "react-native";

import { Provider, Portal, Appbar, IconButton, Menu } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

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
    sortAndFilterChapters,
    updateNovelAction,
} from "../../redux/novel/novel.actions";
import {
    useContinueReading,
    useNovel,
    usePreferences,
    useTheme,
} from "../../hooks/reduxHooks";
import { showToast } from "../../hooks/showToast";

import ChapterItem from "./components/ChapterItem";
import NovelInfoHeader from "./components/NovelHeader";
import ChaptersSettingsSheet from "./components/ChaptersSettingsSheet";
import TrackSheet from "./components/Tracker/TrackSheet";
import { Row } from "../../components/Common";
import JumpToChapterModal from "./components/JumpToChapterModal";
import { Actionbar } from "../../components/Actionbar/Actionbar";

const Novel = ({ route, navigation }) => {
    const item = route.params;
    const { sourceId, novelUrl, novelName, followed, novelId } = item;

    const theme = useTheme();
    const dispatch = useDispatch();
    const { novel, chapters, loading, updating } = useNovel();
    const { downloadQueue } = useSelector((state) => state.downloadsReducer);

    const [selected, setSelected] = useState([]);
    const [downloadMenu, showDownloadMenu] = useState(false);

    let flatlistRef = useRef(null);
    let chaptersSettingsSheetRef = useRef(null);
    let trackerSheetRef = useRef(null);

    const {
        sort = "ORDER BY chapterId ASC",
        filter = "",
        showChapterTitles = false,
    } = usePreferences(novel.novelId);

    let { lastReadChapter, position } = useContinueReading(
        chapters,
        novel.novelId
    );

    useEffect(() => {
        dispatch(
            getNovelAction(followed, sourceId, novelUrl, novelId, sort, filter)
        );
    }, [getNovelAction]);

    const onRefresh = () => {
        dispatch(updateNovelAction(sourceId, novelUrl, novelId, sort, filter));
        showToast(`Updated ${novelName}`);
    };

    const refreshControl = () => (
        <RefreshControl
            onRefresh={onRefresh}
            refreshing={updating}
            colors={[theme.textColorPrimary]}
            progressBackgroundColor={theme.colorPrimary}
        />
    );

    const [jumpToChapterModal, showJumpToChapterModal] = useState(false);

    const keyExtractor = useCallback((item) => item.chapterId.toString(), []);

    const downloadChapter = (chapterUrl, chapterName, chapterId) =>
        dispatch(
            downloadChapterAction(
                sourceId,
                novelUrl,
                chapterUrl,
                chapterName,
                chapterId
            )
        );

    const deleteChapter = (chapterId, chapterName) =>
        dispatch(deleteChapterAction(chapterId, chapterName));

    const isSelected = (chapterId) => {
        return selected.some((obj) => obj.chapterId === chapterId);
    };

    const onSelectPress = (chapter, navigateToChapter) => {
        if (selected.length === 0) {
            navigateToChapter();
        } else {
            if (isSelected(chapter.chapterId)) {
                setSelected((selected) =>
                    selected.filter(
                        (item) => item.chapterId !== chapter.chapterId
                    )
                );
            } else {
                setSelected((selected) => [...selected, chapter]);
            }
        }
    };

    const onSelectLongPress = (chapter) => {
        if (isSelected(chapter.chapterId)) {
            setSelected((selected) =>
                selected.filter((item) => item.chapterId !== chapter.chapterId)
            );
        } else {
            setSelected((selected) => [...selected, chapter]);
        }
    };

    const navigateToChapter = (chapter) =>
        navigation.navigate("Chapter", {
            sourceId,
            novelUrl,
            novelName,
            ...chapter,
        });

    const showProgressPercentage = (chapter) => {
        const savedProgress =
            position &&
            position[chapter.chapterId] &&
            position[chapter.chapterId].percentage;
        if (savedProgress < 100 && savedProgress > 0 && !chapter.read) {
            return (
                <Text
                    style={{
                        color: theme.textColorHint,
                        fontSize: 12,
                        marginLeft: chapter.releaseDate ? 5 : 0,
                    }}
                    numberOfLines={1}
                >
                    {chapter.releaseDate && "•  "}
                    {"Progress " + position[chapter.chapterId].percentage + "%"}
                </Text>
            );
        }
    };

    const renderItem = ({ item, index }) => (
        <ChapterItem
            theme={theme}
            chapter={item}
            index={index}
            showChapterTitles={showChapterTitles}
            downloadQueue={downloadQueue}
            deleteChapter={deleteChapter}
            downloadChapter={downloadChapter}
            isSelected={isSelected}
            onSelectPress={onSelectPress}
            onSelectLongPress={onSelectLongPress}
            navigateToChapter={navigateToChapter}
            showProgressPercentage={showProgressPercentage}
        />
    );

    return (
        <Provider>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                {selected.length > 0 ? (
                    <View
                        style={{
                            backgroundColor: theme.colorPrimary,
                            position: "absolute",
                            zIndex: 1,
                            width: Dimensions.get("window").width,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingTop: StatusBar.currentHeight,
                            paddingBottom: 8,
                            elevation: 2,
                        }}
                    >
                        <Appbar.Action
                            icon="close"
                            color={theme.textColorPrimary}
                            onPress={() => {
                                setSelected([]);
                            }}
                        />
                        <Appbar.Content
                            title={selected.length}
                            titleStyle={{ color: theme.textColorPrimary }}
                        />

                        <Appbar.Action
                            icon="select-all"
                            color={theme.textColorPrimary}
                            onPress={() => {
                                setSelected(chapters);
                            }}
                        />
                    </View>
                ) : (
                    <View
                        style={{
                            position: "absolute",
                            zIndex: 1,
                            height: StatusBar.currentHeight + 54,
                            width: "100%",
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <IconButton
                            icon="arrow-left"
                            color="white"
                            size={24}
                            style={{ marginTop: StatusBar.currentHeight + 8 }}
                            onPress={() => navigation.goBack()}
                        />
                        <Row>
                            <Menu
                                visible={downloadMenu}
                                onDismiss={() => showDownloadMenu(false)}
                                anchor={
                                    <IconButton
                                        icon="download"
                                        color="white"
                                        size={24}
                                        style={{
                                            marginTop:
                                                StatusBar.currentHeight + 8,
                                        }}
                                        onPress={() => showDownloadMenu(true)}
                                    />
                                }
                                contentStyle={{
                                    backgroundColor: theme.menuColor,
                                }}
                            >
                                <Menu.Item
                                    title="Download all"
                                    style={{ backgroundColor: theme.menuColor }}
                                    titleStyle={{
                                        color: theme.textColorPrimary,
                                    }}
                                    onPress={() =>
                                        dispatch(
                                            downloadAllChaptersAction(
                                                novel.sourceId,
                                                novel.novelUrl,
                                                chapters
                                            )
                                        )
                                    }
                                />
                                <Menu.Item
                                    title="Delete downloads"
                                    style={{ backgroundColor: theme.menuColor }}
                                    titleStyle={{
                                        color: theme.textColorPrimary,
                                    }}
                                    onPress={() =>
                                        dispatch(
                                            deleteAllChaptersAction(chapters)
                                        )
                                    }
                                />
                            </Menu>
                            <IconButton
                                icon="text-box-search-outline"
                                color="white"
                                size={21}
                                style={{
                                    marginTop: StatusBar.currentHeight + 8,
                                }}
                                onPress={() => showJumpToChapterModal(true)}
                            />
                            <IconButton
                                icon="share-variant"
                                color="white"
                                size={21}
                                style={{
                                    marginTop: StatusBar.currentHeight + 8,
                                    marginRight: 16,
                                }}
                                onPress={() =>
                                    Share.share({
                                        message: novel.sourceUrl,
                                    })
                                }
                            />
                        </Row>
                    </View>
                )}
                <FlatList
                    ref={(ref) => (flatlistRef.current = ref)}
                    data={!loading && chapters}
                    keyExtractor={keyExtractor}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={15}
                    initialNumToRender={7}
                    renderItem={renderItem}
                    ListHeaderComponent={
                        <NovelInfoHeader
                            item={item}
                            novel={novel}
                            theme={theme}
                            filter={filter}
                            loading={loading}
                            lastRead={lastReadChapter}
                            dispatch={dispatch}
                            chapters={chapters}
                            navigation={navigation}
                            trackerSheetRef={trackerSheetRef}
                            chaptersSettingsSheetRef={chaptersSettingsSheetRef}
                        />
                    }
                    refreshControl={refreshControl()}
                />
                {selected.length > 0 && (
                    <Actionbar
                        theme={theme}
                        actions={[
                            selected.some((obj) => obj.downloaded === 0) && {
                                icon: "download-outline",
                                onPress: () => {
                                    dispatch(
                                        downloadAllChaptersAction(
                                            novel.sourceId,
                                            novel.novelUrl,
                                            selected
                                        )
                                    );
                                    setSelected([]);
                                },
                            },
                            selected.some((obj) => obj.downloaded === 1) && {
                                icon: "trash-can-outline",
                                onPress: () => {
                                    dispatch(deleteAllChaptersAction(selected));
                                    setSelected([]);
                                },
                            },
                            {
                                icon: "bookmark-outline",
                                onPress: () => {
                                    dispatch(bookmarkChapterAction(selected));
                                    setSelected([]);
                                },
                            },
                            selected.some((obj) => obj.read === 0) && {
                                icon: "check",
                                onPress: () => {
                                    dispatch(
                                        markChaptersRead(
                                            selected,
                                            novel.novelId,
                                            sort,
                                            filter
                                        )
                                    );
                                    setSelected([]);
                                },
                            },
                            selected.some((obj) => obj.read === 1) && {
                                icon: "check-outline",
                                onPress: () => {
                                    dispatch(
                                        markChapterUnreadAction(
                                            selected,
                                            novel.novelId
                                        )
                                    );
                                    setSelected([]);
                                },
                            },
                            selected.length === 1 && {
                                icon: "playlist-check",
                                onPress: () => {
                                    dispatch(
                                        markPreviousChaptersReadAction(
                                            selected[0].chapterId,
                                            selected[0].novelId
                                        )
                                    );
                                    setSelected([]);
                                },
                            },
                        ]}
                    />
                )}
                {!loading && (
                    <Portal>
                        <JumpToChapterModal
                            modalVisible={jumpToChapterModal}
                            hideModal={() => showJumpToChapterModal(false)}
                            theme={theme}
                            chapters={chapters}
                            novel={novel}
                            navigation={navigation}
                        />
                        <ChaptersSettingsSheet
                            novelUrl={novelUrl}
                            bottomSheetRef={chaptersSettingsSheetRef}
                            dispatch={dispatch}
                            sortAndFilterChapters={sortAndFilterChapters}
                            novelId={novel.novelId}
                            sort={sort}
                            theme={theme}
                            filter={filter}
                            showChapterTitles={showChapterTitles}
                        />
                        <TrackSheet
                            bottomSheetRef={trackerSheetRef}
                            novelId={novel.novelId}
                            novelName={novel.novelName}
                            theme={theme}
                        />
                    </Portal>
                )}
            </View>
        </Provider>
    );
};

export default Novel;

const styles = StyleSheet.create({
    container: { flex: 1 },
    rowBack: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

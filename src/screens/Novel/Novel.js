import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    RefreshControl,
    StatusBar,
    Dimensions,
    Share,
} from "react-native";

import { Provider, Portal, Appbar, IconButton, Menu } from "react-native-paper";
import { useDispatch } from "react-redux";

import {
    bookmarkChapterAction,
    deleteAllChaptersAction,
    downloadAllChaptersAction,
    getNovelAction,
    markChapterReadAction,
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
import ChapterActionsSheet from "./components/ChapterActionsSheet";
import { Row } from "../../components/Common";

const Novel = ({ route, navigation }) => {
    const item = route.params;
    const { sourceId, novelUrl, novelName, followed, novelId } = item;

    const theme = useTheme();
    const dispatch = useDispatch();
    const { novel, chapters, loading, updating, downloading } = useNovel();

    const [selected, setSelected] = useState([]);
    const [downloadMenu, showDownloadMenu] = useState(false);

    let chaptersSettingsSheetRef = useRef(null);
    let trackerSheetRef = useRef(null);
    let chapterActionsSheetRef = useRef(null);

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

    const renderItem = ({ item, index }) => (
        <ChapterItem
            theme={theme}
            chapter={item}
            index={index}
            novelUrl={novelUrl}
            dispatch={dispatch}
            sourceId={sourceId}
            navigation={navigation}
            lastReadChapter={lastReadChapter}
            position={position}
            downloading={downloading}
            selected={selected}
            novelName={novelName}
            selected={selected}
            setSelected={setSelected}
            showChapterTitles={showChapterTitles}
            chapterActionsSheetRef={chapterActionsSheetRef}
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
                    data={!loading && chapters}
                    keyExtractor={(item) => item.chapterId.toString()}
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
                    <View
                        style={{
                            position: "absolute",
                            width: Dimensions.get("window").width - 32,
                            bottom: 0,
                            margin: 16,
                            backgroundColor: theme.colorPrimary,
                            borderRadius: 6,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            elevation: 2,
                        }}
                    >
                        {selected.some((obj) => obj.downloaded === 0) && (
                            <Appbar.Action
                                icon="download-outline"
                                color={theme.textColorPrimary}
                                onPress={() => {
                                    dispatch(
                                        downloadAllChaptersAction(
                                            novel.sourceId,
                                            novel.novelUrl,
                                            selected
                                        )
                                    );
                                    setSelected([]);
                                }}
                            />
                        )}
                        {selected.some((obj) => obj.downloaded === 1) && (
                            <Appbar.Action
                                icon="trash-can-outline"
                                color={theme.textColorPrimary}
                                onPress={() => {
                                    dispatch(deleteAllChaptersAction(selected));
                                    setSelected([]);
                                }}
                            />
                        )}
                        <Appbar.Action
                            icon="bookmark-outline"
                            color={theme.textColorPrimary}
                            onPress={() => {
                                dispatch(bookmarkChapterAction(selected));
                                setSelected([]);
                            }}
                        />

                        {selected.some((obj) => obj.read === 0) && (
                            <Appbar.Action
                                icon="check"
                                color={theme.textColorPrimary}
                                onPress={() => {
                                    dispatch(
                                        markChaptersRead(
                                            selected,
                                            novel.novelId,
                                            sort,
                                            filter
                                        )
                                    );
                                    setSelected([]);
                                }}
                            />
                        )}

                        {selected.some((obj) => obj.read === 1) && (
                            <Appbar.Action
                                icon="check-outline"
                                color={theme.textColorPrimary}
                                onPress={() => {
                                    dispatch(
                                        markChapterUnreadAction(
                                            selected,
                                            novel.novelId
                                        )
                                    );
                                    setSelected([]);
                                }}
                            />
                        )}
                        {selected.length === 1 && (
                            <Appbar.Action
                                icon="playlist-check"
                                color={theme.textColorPrimary}
                                onPress={() => {
                                    dispatch(
                                        markPreviousChaptersReadAction(
                                            selected[0].chapterId,
                                            selected[0].novelId
                                        )
                                    );
                                    setSelected([]);
                                }}
                            />
                        )}
                    </View>
                )}
                {!loading && (
                    <Portal>
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
                        {/* <ChapterActionsSheet
                            theme={theme}
                            selected={selected}
                            chapters={chapters}
                            dispatch={dispatch}
                            setSelected={setSelected}
                            bottomSheetRef={chapterActionsSheetRef}
                            markChapterReadAction={markChapterReadAction}
                            markChapterUnreadAction={markChapterUnreadAction}
                            bookmarkChapterAction={bookmarkChapterAction}
                        /> */}
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

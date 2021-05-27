import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    RefreshControl,
    StatusBar,
} from "react-native";

import {
    Provider,
    Portal,
    Appbar as MaterialAppbar,
    IconButton,
} from "react-native-paper";
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
} from "../../Hooks/reduxHooks";
import { showToast } from "../../Hooks/showToast";

import ChapterItem from "./components/ChapterItem";
import NovelInfoHeader from "./components/NovelHeader";
import ChaptersSettingsSheet from "./components/ChaptersSettingsSheet";
import TrackSheet from "./components/Tracker/TrackSheet";
import ChapterActionsSheet from "./components/ChapterActionsSheet";
import { Appbar } from "../../Components/Appbar";

const Novel = ({ route, navigation }) => {
    const item = route.params;
    const { sourceId, novelUrl, novelName, followed, novelId } = item;

    const theme = useTheme();
    const dispatch = useDispatch();
    const { novel, chapters, loading, updating, downloading } = useNovel();

    const [selected, setSelected] = useState([]);

    let chaptersSettingsSheetRef = useRef(null);
    let trackerSheetRef = useRef(null);
    let chapterActionsSheetRef = useRef(null);

    const { sort = "ORDER BY chapterId ASC", filter = "" } = usePreferences(
        novel.novelId
    );

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

    const renderItem = ({ item }) => (
        <ChapterItem
            theme={theme}
            chapter={item}
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
                    <MaterialAppbar.Header
                        style={{
                            backgroundColor: theme.colorPrimary,
                        }}
                    >
                        <MaterialAppbar.Action
                            icon="close"
                            color={theme.textColorPrimary}
                            onPress={() => {
                                setSelected([]);
                            }}
                        />
                        <MaterialAppbar.Content
                            title={selected.length}
                            titleStyle={{ color: theme.textColorPrimary }}
                        />
                        <MaterialAppbar.Action
                            icon="bookmark-outline"
                            color={theme.textColorPrimary}
                            onPress={() => {
                                dispatch(bookmarkChapterAction(selected));
                                setSelected([]);
                            }}
                        />

                        {selected.some((obj) => obj.read === 0) && (
                            <MaterialAppbar.Action
                                icon="check"
                                color={theme.textColorPrimary}
                                onPress={() => {
                                    dispatch(markChaptersRead(selected));
                                    setSelected([]);
                                }}
                            />
                        )}
                        {selected.some((obj) => obj.read === 1) && (
                            <MaterialAppbar.Action
                                icon="check-outline"
                                color={theme.textColorPrimary}
                                onPress={() => {
                                    dispatch(markChapterUnreadAction(selected));
                                    setSelected([]);
                                }}
                            />
                        )}
                        {selected.length === 1 && (
                            <MaterialAppbar.Action
                                icon="eye-check"
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
                        {selected.some((obj) => obj.downloaded === 1) && (
                            <MaterialAppbar.Action
                                icon="trash-can-outline"
                                color={theme.textColorPrimary}
                                onPress={() => {
                                    dispatch(deleteAllChaptersAction(selected));
                                    setSelected([]);
                                }}
                            />
                        )}

                        {selected.some((obj) => obj.downloaded === 0) && (
                            <MaterialAppbar.Action
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
                        <MaterialAppbar.Action
                            icon="select-all"
                            color={theme.textColorPrimary}
                            onPress={() => {
                                setSelected(chapters);
                            }}
                        />
                    </MaterialAppbar.Header>
                ) : (
                    <IconButton
                        icon="arrow-left"
                        color="white"
                        size={24}
                        onPress={() => navigation.goBack()}
                        style={{
                            position: "absolute",
                            zIndex: 1,
                            top: StatusBar.currentHeight + 8,
                            left: 8,
                        }}
                    />
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

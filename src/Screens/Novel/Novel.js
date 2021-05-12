import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    Animated,
    Dimensions,
    Text,
    RefreshControl,
    Vibration,
} from "react-native";

import { Provider, Portal, IconButton } from "react-native-paper";
import { useDispatch } from "react-redux";

import {
    bookmarkChapterAction,
    getNovelAction,
    markChapterReadAction,
    markChapterUnreadAction,
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
import { SwipeListView } from "react-native-swipe-list-view";

const Novel = ({ route, navigation }) => {
    const item = route.params;
    const { sourceId, novelUrl, novelName, followed, novelId } = item;

    const theme = useTheme();
    const dispatch = useDispatch();
    const { novel, chapters, loading, updating, downloading } = useNovel();

    // const [selected, setSelected] = useState([]);

    let chaptersSettingsSheetRef = useRef(null);
    let trackerSheetRef = useRef(null);
    // let chapterActionsSheetRef = useRef(null);

    const { sort = "ORDER BY chapterId ASC", filter = "" } = usePreferences(
        novel.novelId
    );

    let lastRead = useContinueReading(chapters, novel.novelId);

    useEffect(() => {
        dispatch(
            getNovelAction(followed, sourceId, novelUrl, novelId, sort, filter)
        );
    }, [getNovelAction]);

    const onRefresh = () => {
        dispatch(updateNovelAction(sourceId, novelUrl, novelId));
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

    const ListHeaderComponent = () => (
        <NovelInfoHeader
            item={item}
            novel={novel}
            theme={theme}
            filter={filter}
            loading={loading}
            lastRead={lastRead}
            dispatch={dispatch}
            chapters={chapters}
            navigation={navigation}
            trackerSheetRef={trackerSheetRef}
            chaptersSettingsSheetRef={chaptersSettingsSheetRef}
        />
    );

    // const selectChapter = (chapterUrl) => {
    //     Vibration.vibrate(50);
    //     setSelected((selected) =>
    //         selected.indexOf(chapterUrl) === -1
    //             ? [...selected, chapterUrl]
    //             : selected.filter((chapter) => chapter !== chapterUrl)
    //     );
    //     if (selected.length >= 0) {
    //         chapterActionsSheetRef.current.show({ velocity: -1.5 });
    //     }
    // };

    const renderItem = ({ item }) => (
        <ChapterItem
            theme={theme}
            chapter={item}
            novelUrl={novelUrl}
            dispatch={dispatch}
            sourceId={sourceId}
            navigation={navigation}
            downloading={downloading}
            // selected={selected}
            // selectChapter={selectChapter}
            // chapterActionsSheetRef={chapterActionsSheetRef}
        />
    );

    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    };

    const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
            <View
                style={{
                    flex: 1 / 2,
                    height: "100%",
                    backgroundColor: theme.colorAccent,
                    paddingLeft: 12,
                    alignItems: "flex-start",
                    justifyContent: "center",
                }}
            >
                <IconButton
                    icon={data.item.bookmark ? "bookmark-off" : "bookmark"}
                    color="white"
                    size={23}
                    onPress={() => {
                        closeRow(rowMap, data.item.chapterId.toString());
                        dispatch(
                            bookmarkChapterAction(
                                data.item.bookmark,
                                data.item.chapterId
                            )
                        );
                    }}
                />
            </View>
            <View
                style={{
                    flex: 1 / 2,
                    alignItems: "flex-end",
                    justifyContent: "center",
                    height: "100%",
                    backgroundColor: "#2E7D32",
                    paddingRight: 12,
                }}
            >
                <IconButton
                    onPress={() => {
                        closeRow(rowMap, data.item.chapterId.toString());
                        if (data.item.read) {
                            dispatch(
                                markChapterUnreadAction(data.item.chapterId)
                            );
                        } else {
                            dispatch(
                                markChapterReadAction(
                                    data.item.chapterId,
                                    novel.novelId
                                )
                            );
                        }
                    }}
                    icon={data.item.read ? "eye-off" : "eye"}
                    color="white"
                    size={23}
                />
            </View>
        </View>
    );

    return (
        <Provider>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <SwipeListView
                    data={!loading && chapters}
                    keyExtractor={(item) => item.chapterId.toString()}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={15}
                    initialNumToRender={7}
                    renderHiddenItem={renderHiddenItem}
                    renderItem={renderItem}
                    ListHeaderComponent={ListHeaderComponent}
                    refreshControl={refreshControl()}
                    leftOpenValue={75}
                    stopLeftSwipe={75}
                    rightOpenValue={-75}
                    stopRightSwipe={-75}
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
                            setSelected={setSelected}
                            bottomSheetRef={chapterActionsSheetRef}
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

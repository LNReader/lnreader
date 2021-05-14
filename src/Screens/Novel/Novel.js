import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, FlatList, RefreshControl } from "react-native";

import { Provider, Portal } from "react-native-paper";
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

const Novel = ({ route, navigation }) => {
    const item = route.params;
    const { sourceId, novelUrl, novelName, followed, novelId } = item;

    const theme = useTheme();
    const dispatch = useDispatch();
    const { novel, chapters, loading, updating, downloading } = useNovel();

    const [selected, setSelected] = useState();

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
                        <ChapterActionsSheet
                            theme={theme}
                            selected={selected}
                            chapters={chapters}
                            dispatch={dispatch}
                            setSelected={setSelected}
                            bottomSheetRef={chapterActionsSheetRef}
                            markChapterReadAction={markChapterReadAction}
                            markChapterUnreadAction={markChapterUnreadAction}
                            bookmarkChapterAction={bookmarkChapterAction}
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

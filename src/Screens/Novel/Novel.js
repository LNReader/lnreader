import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, FlatList, RefreshControl } from "react-native";
import { Provider, Portal } from "react-native-paper";
import {
    useContinueReading,
    useNovel,
    usePreferences,
    useTheme,
    showToast,
} from "../../Hooks/reduxHooks";

import ChapterItem from "./components/ChapterItem";
import NovelInfoHeader from "./components/NovelHeader";
import ChaptersSettingsSheet from "./components/ChaptersSettingsSheet";

import { useDispatch } from "react-redux";

import {
    getNovelAction,
    sortAndFilterChapters,
    updateNovelAction,
} from "../../redux/novel/novel.actions";
import TrackSheet from "./components/Tracker/TrackSheet";

const Novel = ({ route, navigation }) => {
    const item = route.params;
    const {
        sourceId,
        novelUrl,
        novelName,
        novelCover,
        followed,
        novelId,
    } = item;

    const theme = useTheme();
    const dispatch = useDispatch();
    const { novel, chapters, loading, updating, downloading } = useNovel();

    let chaptersSettingsSheetRef = useRef(null);
    let trackerSheetRef = useRef(null);

    const { sort, filter } = usePreferences(
        novelId || (!loading && novel.novelId)
    );

    let lastRead = useContinueReading(
        chapters,
        novelId || (!loading && novel.novelId)
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

    const renderItem = ({ item }) => (
        <ChapterItem
            theme={theme}
            chapter={item}
            novelUrl={novelUrl}
            dispatch={dispatch}
            sourceId={sourceId}
            navigation={navigation}
            downloading={downloading}
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
                    ListHeaderComponent={ListHeaderComponent}
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
                            savedSort={sort}
                            theme={theme}
                            savedFilter={filter}
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
});

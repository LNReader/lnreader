import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, FlatList, RefreshControl } from "react-native";
import { Provider, Portal } from "react-native-paper";
import { useTheme } from "../../Hooks/useTheme";

import ChapterCard from "./components/ChapterCard";
import NovelInfoHeader from "./components/NovelHeader";
import ChaptersSettingsSheet from "./components/ChaptersSettingsSheet";

import { connect } from "react-redux";

import {
    getNovelAction,
    sortAndFilterChapters,
    updateNovelAction,
} from "../../redux/novel/novel.actions";
import TrackSheet from "./components/Tracker/TrackSheet";
import { showToast } from "../../Hooks/showToast";

const Novel = ({
    route,
    novel,
    chapters,
    loading,
    getNovelAction,
    fetching,
    sortAndFilterChapters,
    updateNovelAction,
}) => {
    const {
        sourceId,
        novelUrl,
        novelName,
        novelCover,
        followed,
        novelId,
    } = route.params;

    const theme = useTheme();

    let chaptersSettingsSheetRef = useRef(null);
    let trackerSheetRef = useRef(null);

    const [sort, setSort] = useState("ORDER BY chapterId ASC");
    const [filter, setFilter] = useState("");

    useEffect(() => {
        getNovelAction(followed, sourceId, novelUrl, novelId, sort, filter);
    }, [getNovelAction, sort, filter]);

    const onRefresh = async () => {
        await updateNovelAction(sourceId, novelUrl, novelId);
        showToast(`Updated ${novelName}`);
    };

    const renderChapterCard = ({ item }) => (
        <ChapterCard
            novelUrl={novelUrl}
            extensionId={sourceId}
            chapter={item}
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
                    renderItem={renderChapterCard}
                    ListHeaderComponent={
                        <NovelInfoHeader
                            loading={loading}
                            novelName={novelName}
                            novelCover={novelCover}
                            novel={novel}
                            chapters={chapters}
                            trackerSheetRef={trackerSheetRef}
                            chaptersSettingsSheetRef={chaptersSettingsSheetRef}
                            theme={theme}
                        />
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={fetching}
                            onRefresh={onRefresh}
                            colors={[theme.textColorPrimary]}
                            progressBackgroundColor={theme.colorPrimary}
                        />
                    }
                />
                {!loading && (
                    <Portal>
                        <ChaptersSettingsSheet
                            novelUrl={novelUrl}
                            bottomSheetRef={chaptersSettingsSheetRef}
                            sortAndFilterChapters={sortAndFilterChapters}
                            sort={sort}
                            filter={filter}
                            setSort={setSort}
                            setFilter={setFilter}
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
const mapStateToProps = (state) => ({
    novel: state.novelReducer.novel,
    chapters: state.novelReducer.chapters,
    loading: state.novelReducer.loading,
    fetching: state.novelReducer.fetching,
});

export default connect(mapStateToProps, {
    getNovelAction,

    sortAndFilterChapters,
    updateNovelAction,
})(Novel);

const styles = StyleSheet.create({
    container: { flex: 1 },
});

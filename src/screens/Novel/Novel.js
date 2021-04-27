import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    Text,
    RefreshControl,
    ToastAndroid,
} from "react-native";
import {
    Provider,
    Portal,
    Modal,
    TextInput,
    IconButton,
} from "react-native-paper";

import ChapterCard from "./components/ChapterCard";
import NovelInfoHeader from "./components/NovelHeader";
import { BottomSheet } from "./components/BottomSheet";

import { connect, useSelector } from "react-redux";

import {
    getNovelAction,
    followNovelAction,
    sortAndFilterChapters,
    updateNovelAction,
    downloadAllChaptersAction,
    deleteAllChaptersAction,
} from "../../redux/novel/novel.actions";
import { TrackerBottomSheet } from "./components/TrackerBottomSheet";
import TrackerSearchModal from "./components/TrackerSearchModal";

const Novel = ({
    route,
    theme,
    novel,
    chapters,
    loading,
    getNovelAction,
    fetching,
    followNovelAction,
    sortAndFilterChapters,
    updateNovelAction,
    downloadAllChaptersAction,
    deleteAllChaptersAction,
}) => {
    const {
        sourceId,
        novelUrl,
        novelName,
        novelCover,
        followed,
        novelId,
    } = route.params;

    let _panel = useRef(null); // Bottomsheet ref

    let trackerBottomsheet = useRef(null); // Bottomsheet ref

    const [sort, setSort] = useState("ORDER BY chapterId ASC");
    const [filter, setFilter] = useState("");

    const trackedNovels = useSelector(
        (state) => state.trackerReducer.trackedNovels
    );

    useEffect(() => {
        getNovelAction(followed, sourceId, novelUrl, novelId, sort, filter);
    }, [getNovelAction, followNovelAction, sort, filter]);

    let lastRead = !loading && chapters.find((obj) => obj.read === 0);

    const renderChapterCard = ({ item }) => (
        <ChapterCard
            novelUrl={novelUrl}
            extensionId={sourceId}
            chapter={item}
        />
    );

    const onRefresh = () => {
        updateNovelAction(sourceId, novelUrl, novelId);
        ToastAndroid.show(`Updated ${novelName}`, ToastAndroid.SHORT);
    };

    // Tracker Modal
    const [visible, setVisible] = useState(false);
    const showModal = () => {
        setVisible(true);
    };
    const hideModal = () => setVisible(false);

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
                            theme={theme}
                            item={{ novelName, novelCover }}
                            novel={novel}
                            noOfChapters={chapters?.length}
                            followNovelAction={followNovelAction}
                            loading={loading}
                            lastRead={lastRead}
                            bottomSheetRef={_panel}
                            trackerBottomsheetRef={trackerBottomsheet}
                            downloadAllChapters={() =>
                                downloadAllChaptersAction(
                                    sourceId,
                                    novelUrl,
                                    chapters
                                )
                            }
                            deleteAllChapters={() =>
                                deleteAllChaptersAction(chapters)
                            }
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
                <Portal>
                    <BottomSheet
                        novelUrl={novelUrl}
                        bottomSheetRef={_panel}
                        sortAndFilterChapters={sortAndFilterChapters}
                        sort={sort}
                        filter={filter}
                        setSort={setSort}
                        setFilter={setFilter}
                    />
                    <TrackerBottomSheet
                        bottomSheetRef={trackerBottomsheet}
                        showModal={showModal}
                        novelId={novelId}
                    />
                    <TrackerSearchModal
                        visible={visible}
                        hideModal={hideModal}
                        novelId={novelId}
                        novelName={novelName}
                        theme={theme}
                    />
                </Portal>
            </View>
        </Provider>
    );
};
const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
    novel: state.novelReducer.novel,
    chapters: state.novelReducer.chapters,
    loading: state.novelReducer.loading,
    fetching: state.novelReducer.fetching,
});

export default connect(mapStateToProps, {
    getNovelAction,
    followNovelAction,
    sortAndFilterChapters,
    updateNovelAction,
    downloadAllChaptersAction,
    deleteAllChaptersAction,
})(Novel);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

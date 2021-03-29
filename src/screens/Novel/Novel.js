import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    RefreshControl,
    ToastAndroid,
} from "react-native";
import { Provider, Portal } from "react-native-paper";

import ChapterCard from "./components/ChapterCard";
import NovelInfoHeader from "./components/NovelHeader";
import { BottomSheet } from "./components/BottomSheet";

import { downloadOrDeleteChapter } from "../../services/db";

import { connect } from "react-redux";

import {
    getNovelAction,
    followNovelAction,
    sortAndFilterChapters,
    updateLibraryNovel,
} from "../../redux/actions/novel";

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
    updateLibraryNovel,
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

    useEffect(() => {
        getNovelAction(followed, sourceId, novelUrl, novelId);
    }, []);

    const renderChapterCard = ({ item }) => (
        <ChapterCard
            novelUrl={novelUrl}
            extensionId={sourceId}
            chapter={item}
        />
    );

    const onRefresh = () => {
        updateLibraryNovel(sourceId, novelUrl);
    };

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
                    keyExtractor={(item) => item.chapterUrl}
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
                            noOfChapters={chapters.length}
                            followNovelAction={followNovelAction}
                            loading={loading}
                            bottomSheetRef={_panel}
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
    updateLibraryNovel,
})(Novel);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

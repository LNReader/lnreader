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
    getNovel,
    insertNovelInLibrary,
    sortAndFilterChapters,
    updateLibraryNovel,
} from "../../redux/actions/novel";

const Novel = ({
    route,
    theme,
    novel,
    chapters,
    loading,
    getNovel,
    fetching,
    insertNovelInLibrary,
    sortAndFilterChapters,
    updateLibraryNovel,
}) => {
    const {
        extensionId,
        novelUrl,
        novelName,
        novelCover,
        libraryStatus,
    } = route.params;

    let _panel = useRef(null); // Bottomsheet ref

    useEffect(() => {
        getNovel(libraryStatus, extensionId, novelUrl);
    }, []);

    const renderChapterCard = ({ item }) => (
        <ChapterCard
            novelUrl={novelUrl}
            extensionId={extensionId}
            chapter={item}
        />
    );

    const onRefresh = () => {
        updateLibraryNovel(extensionId, novelUrl);
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
                            insertNovelInLibrary={insertNovelInLibrary}
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
    getNovel,
    insertNovelInLibrary,
    sortAndFilterChapters,
    updateLibraryNovel,
})(Novel);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

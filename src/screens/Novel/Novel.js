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
} from "../../redux/actions/novel";

const Novel = ({
    route,
    navigation,
    theme,
    novel,
    chapters,
    loading,
    getNovel,
    fetching,
    insertNovelInLibrary,
    sortAndFilterChapters,
}) => {
    const {
        extensionId,
        novelUrl,
        navigatingFrom,
        novelName,
        novelCover,
    } = route.params;

    const [downloading, setDownloading] = useState({
        downloading: false,
        chapterUrl: "",
    });

    let _panel = useRef(null); // Bottomsheet ref

    /**
     * Download chapter from source
     *
     * If downloaded then delete from db
     */

    const downloadChapter = (
        downloadStatus,
        extensionId,
        novelUrl,
        chapterUrl,
        chapterName
    ) => {
        setDownloading({ downloading: true, chapterUrl: chapterUrl });
        downloadOrDeleteChapter(
            downloadStatus,
            extensionId,
            novelUrl,
            chapterUrl
        ).then((res) => {
            setDownloading({ downloading: false });
            ToastAndroid.show(
                !downloadStatus
                    ? `Downloaded ${chapterName}`
                    : `Deleted ${chapterName}`,
                ToastAndroid.SHORT
            );
        });
    };

    useEffect(() => {
        getNovel(navigatingFrom, extensionId, novelUrl);
    }, []);

    const renderChapterCard = ({ item }) =>
        !loading && (
            <ChapterCard
                navigation={navigation}
                novelUrl={novelUrl}
                extensionId={extensionId}
                chapter={item}
                downloadChapter={downloadChapter}
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
                    data={chapters}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.chapterUrl}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={15}
                    initialNumToRender={7}
                    renderItem={renderChapterCard}
                    ListHeaderComponent={() => (
                        <NovelInfoHeader
                            item={{ novelName, novelCover }}
                            novel={novel}
                            noOfChapters={chapters.length}
                            insertNovelInLibrary={insertNovelInLibrary}
                            navigatingFrom={navigatingFrom}
                            loading={loading}
                            bottomSheetRef={_panel}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={fetching}
                            // onRefresh={onRefresh}
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
})(Novel);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

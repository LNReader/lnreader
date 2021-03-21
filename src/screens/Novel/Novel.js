import React, { useState, useCallback, useRef, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
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

import { toggleFavourite, downloadOrDeleteChapter } from "../../services/db";

import { connect } from "react-redux";

import { getNovel } from "../../redux/actions/novel";

const Novel = ({
    route,
    navigation,
    theme,
    novel,
    chapters,
    loading,
    getNovel,
}) => {
    const item = route.params;

    const {
        extensionId,
        novelUrl,
        navigatingFrom,
        novelName,
        novelCover,
    } = route.params;

    // const [refreshing, setRefreshing] = useState(false);

    const [libraryStatus, setlibraryStatus] = useState(item.libraryStatus);

    const [sort, setSort] = useState("");
    const [filter, setFilter] = useState("");

    const [downloading, setDownloading] = useState({
        downloading: false,
        chapterUrl: "",
    });

    let _panel = useRef(null); // Bottomsheet ref

    /**
     * Insert or remove novel from library
     */

    const insertNovelInLib = async () => {
        toggleFavourite(libraryStatus, novelUrl).then((res) => {
            setlibraryStatus(res);
            ToastAndroid.show(
                res ? "Added to library" : "Removed from library",
                ToastAndroid.SHORT
            );
        });
    };

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

    useFocusEffect(
        useCallback(() => {
            getNovel(navigatingFrom, extensionId, novelUrl);
        }, [sort, filter])
    );

    const onRefresh = async () => {
        // setRefreshing(true);
        // checkIfExistsInDb();
    };

    const renderChapterCard = ({ item }) => (
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
                    extraData={[sort, filter]}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.chapterUrl}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={15}
                    initialNumToRender={7}
                    renderItem={renderChapterCard}
                    ListHeaderComponent={() => (
                        <NovelInfoHeader
                            item={{
                                novelCover: novelCover,
                                novelName: novelName,
                            }}
                            novel={novel}
                            noOfChapters={chapters.length}
                            libraryStatus={libraryStatus}
                            insertNovelInLib={insertNovelInLib}
                            navigatingFrom={navigatingFrom}
                            loading={loading}
                            bottomSheetRef={_panel}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            // onRefresh={onRefresh}
                            colors={[theme.textColorPrimary]}
                            progressBackgroundColor={theme.colorPrimary}
                        />
                    }
                />
                <Portal>
                    <BottomSheet
                        bottomSheetRef={_panel}
                        sort={sort}
                        filter={filter}
                        sortChapters={setSort}
                        filterChapters={setFilter}
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
});

export default connect(mapStateToProps, { getNovel })(Novel);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

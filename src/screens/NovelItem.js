import React, { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    StyleSheet,
    View,
    FlatList,
    RefreshControl,
    ToastAndroid,
} from "react-native";
import { Provider, Portal } from "react-native-paper";

import ChapterCard from "../components/novel/ChapterCard";
import NovelInfoHeader from "../components/novel/NovelHeader";
import { BottomSheet } from "../components/novel/BottomSheet";

import { fetchNovelFromSource, fetchChaptersFromSource } from "../services/api";
import {
    insertNovelInfoInDb,
    insertChaptersInDb,
    getChaptersFromDb,
    checkNovelInDb,
    getNovelInfoFromDb,
    toggleFavourite,
    downloadOrDeleteChapter,
} from "../services/db";

import { useSelector } from "react-redux";

const NovelItem = ({ route, navigation }) => {
    const item = route.params;
    const theme = useSelector((state) => state.themeReducer.theme);

    const {
        extensionId,
        novelUrl,
        navigatingFrom,
        novelName,
        novelCover,
    } = route.params;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [novel, setNovel] = useState(item);
    const [chapters, setChapters] = useState();

    const [libraryStatus, setlibraryStatus] = useState(item.libraryStatus);

    const [sort, setSort] = useState("");
    const [filter, setFilter] = useState("");

    const [downloading, setDownloading] = useState({
        downloading: false,
        chapterUrl: "",
    });

    let _panel = useRef(null); // Bottomsheet ref

    /**
     * Fetch novel and chapters from source and set loading false
     */

    const getNovelFromSource = async (extensionId, novelUrl) => {
        await fetchNovelFromSource(extensionId, novelUrl).then((response) => {
            setNovel(response);
            insertNovelInfoInDb(response);
        });
        await fetchChaptersFromSource(extensionId, novelUrl).then(
            (response) => {
                setChapters(response);
                insertChaptersInDb(novelUrl, response);
            }
        );
        setlibraryStatus(0);
        setLoading(false);
        setRefreshing(false);
    };

    /**
     * Get chapters from db and set loading false
     */

    const getChapters = async (novelUrl) => {
        await getChaptersFromDb(novelUrl, filter, sort).then((response) =>
            setChapters(response)
        );
        setLoading(false);
        setRefreshing(false);
    };

    /**
     * Get novel and chapters from database
     */

    const getNovelFromDb = async () => {
        await getNovelInfoFromDb(novelUrl).then((res) => {
            setNovel(res);
            setlibraryStatus(res.libraryStatus);
        });
        getChapters(novelUrl);
    };

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

    /**
     * Check if the novel is in db. If not, fetch from source
     *
     * If navigating from library then directly get chapters from db
     */

    const checkIfExistsInDb = () => {
        if (navigatingFrom === 1) {
            getChapters(novelUrl);
        } else {
            setRefreshing(true);
            checkNovelInDb(novelUrl).then((res) => {
                if (res) {
                    getNovelFromDb(novelUrl);
                } else {
                    getNovelFromSource(extensionId, novelUrl);
                }
            });
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkIfExistsInDb();
        }, [sort, filter])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        checkIfExistsInDb();
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
                    { backgroundColor: theme.colorDarkPrimaryDark },
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
                            noOfChapters={!loading && chapters.length}
                            libraryStatus={libraryStatus}
                            insertNovelInLib={insertNovelInLib}
                            navigatingFrom={navigatingFrom}
                            loading={loading}
                            bottomSheetRef={_panel}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.textColorPrimaryDark]}
                            progressBackgroundColor={theme.colorDarkPrimary}
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

export default NovelItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

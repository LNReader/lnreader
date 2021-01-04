import React, { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    StyleSheet,
    View,
    FlatList,
    RefreshControl,
    ToastAndroid,
} from "react-native";
import { Appbar, Provider, ProgressBar, Portal } from "react-native-paper";

import { theme } from "../theming/theme";

import ChapterCard from "../components/ChapterCard";
import NovelInfoHeader from "../components/NovelInfoHeader";
import { BottomSheet } from "../components/NovelItemBottomSheet";

import { fetchNovelFromSource } from "../utils/api";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const NovelItem = ({ route, navigation }) => {
    const item = route.params;

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

    let _panel = useRef(null);

    const getNovel = (extensionId, novelUrl) => {
        fetchNovelFromSource(extensionId, novelUrl).then((response) => {
            setNovel(response.novel);
            setChapters(response.chapters);
            setLoading(false);
            setRefreshing(false);
            insertIntoDb(response.novel, response.chapters);
        });
    };

    const getChaptersFromDb = () => {
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM ChapterTable WHERE novelUrl=? ${filter} ${sort}`,
                [novelUrl],
                (txObj, { rows: { _array } }) => {
                    setChapters(_array);
                    setLoading(false);
                    setRefreshing(false);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    const insertIntoDb = (nov, chaps) => {
        // Insert into database
        db.transaction((tx) => {
            tx.executeSql(
                "INSERT INTO LibraryTable (novelUrl, novelName, novelCover, novelSummary, `Author(s)`, `Genre(s)`, Status, extensionId, lastRead, lastReadName, sourceUrl, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    novelUrl,
                    novelName,
                    novelCover,
                    nov.novelSummary,
                    nov["Author(s)"],
                    nov["Genre(s)"],
                    nov.Status,
                    extensionId,
                    nov.lastRead,
                    nov.lastReadName,
                    nov.sourceUrl,
                    nov.source,
                ],
                (txObj, res) => {
                    console.log("Inserted into DB");
                },
                (txObj, error) => console.log("Error ", error)
            );

            // console.log(chaps[0]);

            // Insert chapters into database
            chaps.map((chap) =>
                tx.executeSql(
                    "INSERT INTO ChapterTable (chapterUrl, chapterName, releaseDate, novelUrl) values (?, ?, ?, ?)",
                    [
                        chap.chapterUrl,
                        chap.chapterName,
                        chap.releaseDate,
                        novelUrl,
                    ]
                )
            );
        });
    };

    /**
     * Download th chapter if not downloaded else delete
     */
    const downloadChapter = (downloadStatus, cdUrl) => {
        if (downloadStatus === 0) {
            fetch(
                `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${novelUrl}${cdUrl}`
            )
                .then((response) => response.json())
                .then((json) => {
                    db.transaction((tx) => {
                        tx.executeSql(
                            `UPDATE ChapterTable SET downloaded = 1 WHERE chapterUrl = ?`,
                            [cdUrl]
                        );
                        tx.executeSql(
                            `INSERT INTO DownloadsTable (chapterUrl, novelUrl, chapterName, chapterText, prevChapter, nextChapter) VALUES (?, ?, ?, ?, ?, ?)`,
                            [
                                cdUrl,
                                novelUrl,
                                json.chapterName,
                                json.chapterText,
                                json.prevChapter,
                                json.nextChapter,
                            ],
                            (tx, res) => {
                                ToastAndroid.show(
                                    `Downloaded ${json.chapterName}`,
                                    ToastAndroid.SHORT
                                );
                            },
                            (txObj, error) => console.log("Error ", error)
                        );
                    });
                })
                .catch((error) => console.error(error))
                .finally(() => {
                    getChaptersFromDb();
                });
        } else {
            db.transaction((tx) => {
                tx.executeSql(
                    `UPDATE ChapterTable SET downloaded = 0 WHERE chapterUrl = ?`,
                    [cdUrl]
                );
                tx.executeSql(
                    `DELETE FROM DownloadsTable WHERE chapterUrl = ?`,
                    [cdUrl],
                    (tx, res) => {
                        getChaptersFromDb();
                        ToastAndroid.show(
                            `Chapter deleted`,
                            ToastAndroid.SHORT
                        );
                    },
                    (txObj, error) => console.log("Error ", error)
                );
            });
        }
    };

    const insertToLibrary = () => {
        if (libraryStatus === 0) {
            // Insert into library
            db.transaction((tx) => {
                tx.executeSql(
                    "UPDATE LibraryTable SET libraryStatus = 1 WHERE novelUrl=?",
                    [item.novelUrl],
                    (tx, res) => {
                        ToastAndroid.show(
                            "Added to library",
                            ToastAndroid.SHORT
                        );
                        setlibraryStatus(1);
                    },
                    (txObj, error) => console.log("Error ", error)
                );
            });
        } else {
            // Delete from library
            db.transaction((tx) => {
                tx.executeSql(
                    "UPDATE LibraryTable SET libraryStatus = 0 WHERE novelUrl=?",
                    [item.novelUrl],
                    (txObj, res) => {
                        ToastAndroid.show(
                            "Removed from library",
                            ToastAndroid.SHORT
                        );
                        setlibraryStatus(0);
                    },
                    (txObj, error) => console.log("Error ", error)
                );
            });
        }
    };

    const checkIfExistsInDb = () => {
        if (navigatingFrom === 1) {
            getChaptersFromDb();
        } else {
            setRefreshing(true);
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT * FROM LibraryTable WHERE novelUrl=? LIMIT 1",
                    [novelUrl],
                    (txObj, res) => {
                        if (res.rows.length === 0) {
                            console.log("Not in db");
                            // Not in database
                            setlibraryStatus(0);
                            getNovel(extensionId, novelUrl);
                        } else {
                            // In database
                            setNovel(res.rows.item(0));
                            setlibraryStatus(res.rows.item(0).libraryStatus);
                            getChaptersFromDb();
                        }
                    },
                    (txObj, error) => console.log("Error ", error)
                );
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
        />
    );

    // const getItemLayout = (data, index) => ({
    //     length: 72,
    //     offset: 72 * index,
    //     index,
    // });

    return (
        <Provider>
            {/* <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
                <Appbar.BackAction
                    onPress={() => {
                        navigation.goBack();
                    }}
                    color={"white"}
                    size={26}
                    style={{ marginRight: 0 }}
                />
                <Appbar.Content
                    title={item.novelName}
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                />
            </Appbar.Header> */}

            <View style={styles.container}>
                {/* <ProgressBar
                    color="#47a84a"
                    indeterminate
                    visible={downloading}
                /> */}
                <FlatList
                    data={chapters}
                    extraData={[sort, filter]}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.chapterUrl}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={15}
                    // getItemLayout={getItemLayout}
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
                            insertToLibrary={insertToLibrary}
                            navigatingFrom={navigatingFrom}
                            loading={loading}
                            bottomSheetRef={_panel}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["white"]}
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
        // backgroundColor: "#202125",
        backgroundColor: theme.colorDarkPrimaryDark,
    },
    fab: {
        backgroundColor: theme.colorAccentDark,
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

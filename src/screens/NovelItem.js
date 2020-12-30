import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    StyleSheet,
    View,
    FlatList,
    RefreshControl,
    ToastAndroid,
} from "react-native";
import { Appbar, FAB, ProgressBar } from "react-native-paper";

import { theme } from "../theming/theme";

import ChapterCard from "../components/ChapterCard";
import NovelInfoHeader from "../components/NovelInfoHeader";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const NovelItem = ({ route, navigation }) => {
    const item = route.params;

    const { extensionId, novelUrl, navigatingFrom } = route.params;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [novel, setNovel] = useState(item);
    const [chapters, setChapters] = useState();

    const [libraryStatus, setlibraryStatus] = useState(item.libraryStatus);
    const [sort, setSort] = useState("ASC");

    const [readingStatus, setReadingStatus] = useState();
    const [downloading, setDownloading] = useState(false);

    const getNovel = () => {
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${item.novelUrl}`
        )
            .then((response) => response.json())
            .then((json) => {
                setNovel(json);
                setChapters(json.novelChapters);
                let chaps = json.novelChapters;
                insertIntoDb(json, json.novelChapters);
                setReadingStatus({
                    chapterName: chaps[0].chapterName,
                    chapterUrl: chaps[0].chapterUrl,
                    fabLabel: "Start",
                });
            })
            .catch((error) => console.error(error))
            .finally(() => {
                setRefreshing(false);
                setLoading(false);
            });
    };

    const getChaptersFromDb = () => {
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM ChapterTable WHERE novelUrl=? ORDER BY chapterId ${sort}`,
                [novelUrl],
                (txObj, { rows: { _array } }) => {
                    setChapters(_array);
                    resumeReading(_array[0]);

                    setLoading(false);
                    setRefreshing(false);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    const sortChapters = () => {
        setRefreshing(true);
        if (sort === "ASC") {
            setSort("DESC");
        } else {
            setSort("ASC");
        }
    };

    const resumeReading = (chap) => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT *  FROM HistoryTable WHERE novelUrl = ?",
                [item.novelUrl],
                (txObj, results) => {
                    if (results.rows.length > 0) {
                        let row = results.rows.item(0);
                        setReadingStatus({
                            chapterUrl: row.chapterUrl,
                            chapterName: row.chapterName,
                            fabLabel: "Resume",
                        });
                    } else {
                        setReadingStatus({
                            chapterUrl: chap.chapterUrl,
                            chapterName: chap.chapterName,
                            fabLabel: "Start",
                        });
                    }
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    const insertIntoDb = (nov, chaps) => {
        // Insert into database
        db.transaction((tx) => {
            tx.executeSql(
                "INSERT INTO LibraryTable (novelUrl, novelName, novelCover, novelSummary, Alternative, `Author(s)`, `Genre(s)`, Type, `Release`, Status, extensionId, libraryStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    novelUrl,
                    nov.novelName,
                    nov.novelCover,
                    nov.novelSummary,
                    nov.Alternative,
                    nov["Author(s)"],
                    nov["Genre(s)"],
                    nov.Type,
                    nov.Release,
                    nov.Status,
                    extensionId,
                    0,
                ]
            );

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
            setDownloading(true);
            fetch(
                `https://lnreader-extensions.herokuapp.com/api/${extensionId}/${cdUrl}`
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
                    setDownloading(false);
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
                            // Not in database
                            setlibraryStatus(0);
                            getNovel();
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
        }, [sort])
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

    const getItemLayout = (data, index) => ({
        length: 72,
        offset: 72 * index,
        index,
    });

    return (
        <>
            <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
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
            </Appbar.Header>

            <View style={styles.container}>
                <ProgressBar
                    color="#47a84a"
                    indeterminate
                    visible={downloading}
                />
                <FlatList
                    data={chapters}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.chapterUrl}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={15}
                    getItemLayout={getItemLayout}
                    initialNumToRender={5}
                    renderItem={renderChapterCard}
                    ListHeaderComponent={() => (
                        <NovelInfoHeader
                            item={item}
                            novel={novel}
                            noOfChapters={!loading && chapters.length}
                            loading={loading}
                            libraryStatus={libraryStatus}
                            insertToLibrary={insertToLibrary}
                            sortChapters={sortChapters}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["white"]}
                            progressBackgroundColor={theme.colorAccentDark}
                        />
                    }
                />
                {readingStatus && (
                    <FAB
                        style={styles.fab}
                        icon="play"
                        uppercase={false}
                        label={readingStatus.fabLabel}
                        color={theme.textColorPrimaryDark}
                        onPress={() => {
                            navigation.navigate("ChapterItem", {
                                chapterUrl: readingStatus.chapterUrl,
                                extensionId,
                                novelUrl,
                                chapterName: readingStatus.chapterName,
                            });
                        }}
                    />
                )}
            </View>
        </>
    );
};

export default NovelItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
    },
    fab: {
        backgroundColor: theme.colorAccentDark,
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
    StyleSheet,
    View,
    FlatList,
    RefreshControl,
    ToastAndroid,
    ActivityIndicator,
} from "react-native";
import { Appbar, FAB, ProgressBar } from "react-native-paper";

import { theme } from "../theming/theme";

import ChapterCard from "../components/ChapterCard";
import NovelInfoHeader from "../components/NovelInfoHeader";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const NovelItem = ({ route, navigation }) => {
    const item = route.params;

    const { extensionId, novelUrl } = route.params;

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
                insertIntoDb(json, json.novelChapters);
                let chaps = json.novelChapters;
                resumeReading(chaps[0].chapterName, chaps[0].chapterUrl);
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
                [item.novelUrl],
                (txObj, { rows: { _array } }) => {
                    setChapters(_array);
                    resumeReading(_array[0].chapterName, _array[0].chapterUrl);
                    setRefreshing(false);
                    setLoading(false);
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

    const resumeReading = (chapName, chapUrl) => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT *  FROM HistoryTable WHERE novelUrl = ?",
                [item.novelUrl],
                (txObj, results) => {
                    let len = results.rows.length;
                    if (len > 0) {
                        let row = results.rows.item(0);
                        setReadingStatus({
                            chapterUrl: row.chapterUrl,
                            chapterName: row.chapterName,
                            fabLabel: "Resume",
                        });
                    } else {
                        setReadingStatus({
                            chapterUrl: chapUrl,
                            chapterName: chapName,
                            fabLabel: "Start",
                        });
                    }
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    const insertIntoDb = (nov, chaps) => {
        db.transaction((tx) => {
            tx.executeSql(
                "INSERT OR REPLACE INTO LibraryTable (novelUrl, novelName, novelCover, novelSummary, Alternative, `Author(s)`, `Genre(s)`, Type, `Release`, Status, extensionId, libraryStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    item.novelUrl,
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
                ],
                (tx, res) => {
                    // console.log("Inserted into DB");
                },
                (txObj, error) => console.log("Error ", error)
            );

            chaps.map((chap) =>
                tx.executeSql(
                    "INSERT INTO ChapterTable (chapterUrl, chapterName, releaseDate, novelUrl) values (?, ?, ?, ?)",
                    [
                        chap.chapterUrl,
                        chap.chapterName,
                        chap.releaseDate,
                        item.novelUrl,
                    ]
                )
            );
        });
    };

    const downloadChapter = (downloadStatus, cdUrl) => {
        setDownloading(true);
        if (downloadStatus === 0) {
            fetch(
                `https://lnreader-extensions.herokuapp.com/api/${extensionId}/${cdUrl}`
            )
                .then((response) => response.json())
                .then((json) => {
                    db.transaction((tx) => {
                        tx.executeSql(
                            `UPDATE ChapterTable SET downloaded = 1 WHERE chapterUrl = ?`,
                            [cdUrl],
                            (tx, res) => {
                                // console.log(
                                //     "Updated Download Status to downloaded"
                                // );
                            },
                            (txObj, error) => console.log("Error ", error)
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
                                // console.log("Inserted into Downloads Table");
                            },
                            (txObj, error) => console.log("Error ", error)
                        );
                    });
                })
                .catch((error) => console.error(error))
                .finally(() => {
                    checkIfExistsInDB();
                });
        } else {
            db.transaction((tx) => {
                tx.executeSql(
                    `UPDATE ChapterTable SET downloaded = 0 WHERE chapterUrl = ?`,
                    [cdUrl],
                    (tx, res) => {
                        // console.log("Updated Download Status to downloaded");
                    },
                    (txObj, error) => console.log("Error ", error)
                );
                tx.executeSql(
                    `DELETE FROM DownloadsTable WHERE chapterUrl = ?`,
                    [cdUrl],
                    (tx, res) => {
                        // console.log("Deleted Download");
                        checkIfExistsInDB();
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
            db.transaction((tx) => {
                tx.executeSql(
                    "UPDATE LibraryTable SET libraryStatus = 1 WHERE novelUrl=?",
                    [item.novelUrl],
                    (tx, res) => {
                        ToastAndroid.show(
                            "Added to library",
                            ToastAndroid.SHORT
                        );
                        // console.log("Inserted into Library");

                        setlibraryStatus(1);
                    },
                    (txObj, error) => console.log("Error ", error)
                );
            });
        } else {
            db.transaction((tx) => {
                tx.executeSql(
                    "UPDATE LibraryTable SET libraryStatus = 0 WHERE novelUrl=?",
                    [item.novelUrl],
                    (txObj, res) => {
                        ToastAndroid.show(
                            "Removed from library",
                            ToastAndroid.SHORT
                        );
                        // console.log("Removed From Library");
                        setlibraryStatus(0);
                    },
                    (txObj, error) => console.log("Error ", error)
                );
            });
        }
    };

    const checkIfExistsInDB = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM LibraryTable WHERE novelUrl=?",
                [novelUrl],
                (txObj, res) => {
                    if (res.rows.length === 0) {
                        setRefreshing(true);
                        setlibraryStatus(0);
                        // console.log("Not In Database");
                        getNovel();
                    } else {
                        // setRefreshing(true);
                        // console.log("In Database");
                        setlibraryStatus(res.rows.item(0).libraryStatus);
                        setNovel(res.rows.item(0));
                        getChaptersFromDb();
                    }
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
        setDownloading(false);
    };

    // useEffect(() => {
    //     checkIfExistsInDB(item.novelUrl);
    // }, [sort]);

    useFocusEffect(
        useCallback(() => {
            checkIfExistsInDB();
        }, [sort])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        checkIfExistsInDB();
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
                    extraData={chapters}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.chapterUrl}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    initialNumToRender={10}
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
                {!loading && readingStatus && (
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
    nameContainer: {
        flex: 1,
        width: "100%",
        marginHorizontal: 15,
        // justifyContent: "center",
    },
    background: {
        height: 240,
    },
    linearGradient: {
        height: "100%",
        backgroundColor: "rgba(256, 256, 256, 0.5)",
    },
    detailsContainer: {
        flex: 1,
        flexDirection: "row",
        margin: 15,
    },
    logo: {
        height: 180,
        width: 120,
        margin: 3.2,
        borderRadius: 6,
    },
    genre: {
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 10,
        marginHorizontal: 2,
        fontSize: 13,
        paddingVertical: 2,
        justifyContent: "center",
        flex: 1,
    },
    name: {
        fontWeight: "bold",
        fontSize: 20,
    },
    fab: {
        backgroundColor: theme.colorAccentDark,
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

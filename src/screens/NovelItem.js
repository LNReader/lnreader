import React, { useState, useCallback, useEffect } from "react";
import {
    StyleSheet,
    View,
    Image,
    ImageBackground,
    Text,
    FlatList,
    ScrollView,
    RefreshControl,
    ToastAndroid,
    ActivityIndicator,
} from "react-native";
import {
    Appbar,
    TouchableRipple,
    IconButton,
    Button,
    FAB,
    ProgressBar,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

import { theme } from "../theming/theme";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const NovelItem = ({ route, navigation }) => {
    const item = route.params;

    const { extensionId, novelUrl } = route.params;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [novel, setNovel] = useState(item);
    const [chapters, setChapters] = useState();
    const [more, setMore] = useState(false);

    const [libraryStatus, setlibraryStatus] = useState(0);
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
                let chaps = json.novelChapters.reverse();
                resumeReading(chaps[0].chapterName, chaps[0].chapterUrl);
            })
            .catch((error) => console.error(error))
            .finally(() => {
                setRefreshing(false);
                setLoading(false);
            });
    };

    const getNovelFromDb = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM LibraryTable WHERE novelUrl=?",
                [item.novelUrl],
                (txObj, results) => {
                    let len = results.rows.length;
                    for (let i = 0; i < len; i++) {
                        let row = results.rows.item(i);
                        setNovel(row);
                        setlibraryStatus(row.libraryStatus);
                    }
                },
                (txObj, error) => console.log("Error ", error)
            );
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
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            setReadingStatus({
                                chapterUrl: row.chapterUrl,
                                chapterName: row.chapterName,
                                fabLabel: "Resume",
                            });
                        }
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
                    console.log("Inserted into DB");
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
                                console.log(
                                    "Updated Download Status to downloaded"
                                );
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
                                console.log("Inserted into Downloads Table");
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
                        console.log("Updated Download Status to downloaded");
                    },
                    (txObj, error) => console.log("Error ", error)
                );
                tx.executeSql(
                    `DELETE FROM DownloadsTable WHERE chapterUrl = ?`,
                    [cdUrl],
                    (tx, res) => {
                        console.log("Deleted Download");
                        checkIfExistsInDB();
                        ToastAndroid.show(
                            `Download deleted`,
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
                        console.log("Inserted into Library");

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
                        console.log("Removed From Library");
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
                        console.log("Not In Database");
                        getNovel();
                    } else {
                        // setRefreshing(true);
                        console.log("In Database");
                        getNovelFromDb();
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
                    renderItem={({ item }) => (
                        <TouchableRipple
                            style={{
                                paddingHorizontal: 15,
                                paddingVertical: 12,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                            onPress={() =>
                                navigation.navigate("ChapterItem", {
                                    chapterUrl: item.chapterUrl,
                                    extensionId,
                                    novelUrl: novelUrl,
                                    chapterName: item.chapterName,
                                })
                            }
                            rippleColor={theme.rippleColorDark}
                        >
                            <>
                                <View>
                                    <Text
                                        style={[
                                            {
                                                color:
                                                    theme.textColorPrimaryDark,
                                            },
                                            item.read === 1 && {
                                                color: theme.textColorHintDark,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.chapterName}
                                    </Text>
                                    <Text
                                        style={[
                                            {
                                                color:
                                                    theme.textColorSecondaryDark,
                                                marginTop: 5,
                                                fontSize: 13,
                                            },
                                            item.read === 1 && {
                                                color: theme.textColorHintDark,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.releaseDate
                                            ? item.releaseDate
                                            : "release-date"}
                                    </Text>
                                </View>
                                <View>
                                    <IconButton
                                        icon={
                                            item.downloaded
                                                ? "check-circle"
                                                : "arrow-down-circle-outline"
                                        }
                                        color={
                                            item.downloaded
                                                ? "#47a84a"
                                                : theme.textColorSecondaryDark
                                        }
                                        size={24}
                                        onPress={() => {
                                            downloadChapter(
                                                item.downloaded,
                                                item.chapterUrl
                                            );
                                        }}
                                    />
                                </View>
                            </>
                        </TouchableRipple>
                    )}
                    ListHeaderComponent={
                        <>
                            <ImageBackground
                                source={{
                                    uri: item.novelCover,
                                }}
                                style={styles.background}
                            >
                                <LinearGradient
                                    colors={["transparent", "#000000"]}
                                    style={styles.linearGradient}
                                >
                                    <View style={styles.detailsContainer}>
                                        <Image
                                            source={{
                                                uri: item.novelCover,
                                            }}
                                            style={styles.logo}
                                        />
                                        <View style={styles.nameContainer}>
                                            <Text
                                                numberOfLines={4}
                                                style={[
                                                    styles.name,
                                                    {
                                                        color:
                                                            theme.textColorPrimaryDark,
                                                    },
                                                ]}
                                            >
                                                {item.novelName}
                                            </Text>
                                            {!loading && (
                                                <>
                                                    <Text
                                                        style={{
                                                            color:
                                                                theme.textColorSecondaryDark,
                                                            marginVertical: 3,
                                                            fontSize: 15,
                                                        }}
                                                        numberOfLines={1}
                                                    >
                                                        {novel.Alternative &&
                                                            novel.Alternative.replace(
                                                                ",",
                                                                ", "
                                                            )}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            color:
                                                                theme.textColorSecondaryDark,
                                                            marginVertical: 3,
                                                            fontSize: 15,
                                                        }}
                                                    >
                                                        {novel[
                                                            "Author(s)"
                                                        ].replace(",", ", ")}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            color:
                                                                theme.textColorSecondaryDark,
                                                            marginVertical: 3,
                                                            fontSize: 15,
                                                        }}
                                                    >
                                                        {novel["Release"]}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            color:
                                                                theme.textColorSecondaryDark,
                                                            marginVertical: 3,
                                                            fontSize: 15,
                                                        }}
                                                    >
                                                        {novel["Status"] +
                                                            " • " +
                                                            novel["Type"]}
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </View>
                                </LinearGradient>
                            </ImageBackground>

                            {!loading && (
                                <>
                                    <Button
                                        color={theme.textColorPrimaryDark}
                                        style={[
                                            {
                                                backgroundColor:
                                                    theme.colorAccentDark,
                                                marginHorizontal: 15,
                                            },
                                            novel.novelSummary.length === 0 && {
                                                marginBottom: 20,
                                            },
                                        ]}
                                        uppercase={false}
                                        labelStyle={{ letterSpacing: 0 }}
                                        onPress={() => insertToLibrary()}
                                    >
                                        {libraryStatus === 0
                                            ? "Add to library"
                                            : "In Library"}
                                    </Button>
                                    {novel.novelSummary.length > 0 && (
                                        <View
                                            style={{
                                                paddingHorizontal: 15,
                                                marginBottom: 10,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color:
                                                        theme.textColorPrimaryDark,
                                                    marginTop: 5,
                                                    paddingVertical: 5,
                                                    fontSize: 15,
                                                }}
                                            >
                                                About
                                            </Text>
                                            <Text
                                                style={{
                                                    color:
                                                        theme.textColorSecondaryDark,
                                                    lineHeight: 20,
                                                }}
                                                numberOfLines={more ? 100 : 2}
                                                onPress={() => setMore(!more)}
                                                ellipsizeMode="clip"
                                            >
                                                {novel.novelSummary}
                                            </Text>
                                            <Text
                                                style={{
                                                    color:
                                                        theme.colorAccentDark,
                                                    fontWeight: "bold",
                                                    position: "absolute",
                                                    bottom: 0,
                                                    right: 15,
                                                }}
                                                onPress={() => setMore(!more)}
                                            >
                                                {more ? "Less" : "More"}
                                            </Text>
                                        </View>
                                    )}
                                    <FlatList
                                        contentContainerStyle={{
                                            paddingHorizontal: 15,
                                            marginBottom: 15,
                                        }}
                                        horizontal
                                        data={novel["Genre(s)"].split(",")}
                                        keyExtractor={(item) => item}
                                        renderItem={({ item }) => (
                                            <Text
                                                style={[
                                                    styles.genre,
                                                    {
                                                        color:
                                                            theme.colorAccentDark,
                                                        borderColor:
                                                            theme.colorAccentDark,
                                                    },
                                                ]}
                                            >
                                                {item}
                                            </Text>
                                        )}
                                    />
                                    <TouchableRipple
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            paddingRight: 15,
                                        }}
                                        onPress={() => sortChapters()}
                                        rippleColor={theme.rippleColorDark}
                                    >
                                        <>
                                            <Text
                                                style={{
                                                    color:
                                                        theme.textColorPrimaryDark,
                                                    paddingHorizontal: 15,
                                                    paddingVertical: 5,
                                                    fontSize: 15,
                                                }}
                                            >
                                                {chapters.length + "  Chapters"}
                                            </Text>
                                            <IconButton
                                                icon="filter-variant"
                                                color={
                                                    theme.textColorPrimaryDark
                                                }
                                                size={24}
                                                onPress={() => sortChapters()}
                                            />
                                        </>
                                    </TouchableRipple>
                                </>
                            )}
                        </>
                    }
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
                            // console.log(readingStatus);
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

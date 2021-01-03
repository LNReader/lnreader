import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import BottomSheet from "../components/ChapterBottomSheet";

import { Appbar, Provider, Portal } from "react-native-paper";
import { theme } from "../theming/theme";
import { CollapsibleHeaderScrollView } from "react-native-collapsible-header-views";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

import { fetchChapterFromSource } from "../utils/api";

const ChapterItem = ({ route, navigation }) => {
    const { extensionId, chapterUrl, novelUrl, chapterName } = route.params;

    const [loading, setLoading] = useState(true);

    const [chapter, setChapter] = useState();

    const [size, setSize] = useState(16);

    const [readerTheme, setReaderTheme] = useState(1);

    const setHistory = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "INSERT INTO HistoryTable (chapterUrl, novelUrl, chapterName, lastRead) VALUES ( ?, ?, ?, (datetime('now','localtime')))",
                [chapterUrl, novelUrl, chapterName],
                (tx, res) =>
                    console.log(
                        "Inserted into history table: " + novelUrl + chapterUrl
                    ),
                (tx, error) => console.log(error)
            );
            tx.executeSql(
                "UPDATE LibraryTable SET lastRead = ?, lastReadName = ?, unread = 0 WHERE novelUrl = ?",
                [chapterUrl, chapterName, novelUrl],
                (tx, res) =>
                    console.log("Set Last read" + novelUrl + chapterUrl),
                (tx, error) => console.log(error)
            );
        });
    };

    const updateHistory = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "UPDATE HistoryTable SET lastRead = (datetime('now','localtime')), chapterName=?, chapterUrl=? WHERE novelUrl = ?",
                [chapterName, chapterUrl, novelUrl],
                (tx, res) =>
                    console.log("Updated into history table: " + novelUrl),
                (tx, error) => console.log(error)
            );
        });
    };

    const setRead = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "UPDATE ChapterTable SET `read` = 1 WHERE chapterUrl = ?",
                [chapterUrl],
                (tx, res) => console.log("Updated readStatus: " + novelUrl),
                (tx, error) => console.log(error)
            );
        });
    };

    const checkIfInHistory = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM HistoryTable WHERE novelUrl=?",
                [novelUrl],
                (txObj, res) => {
                    console.log(res.rows.length);
                    if (res.rows.length === 0) {
                        console.log("Not In History");
                        setHistory();
                    } else {
                        console.log("In History");
                        updateHistory();
                    }
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    const checkIfDownloaded = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM DownloadsTable WHERE chapterUrl=?",
                [chapterUrl],
                (txObj, res) => {
                    console.log(res.rows.length);
                    if (res.rows.length === 0) {
                        // console.log("Not Downloaded");
                        fetchChapterFromSource(
                            extensionId,
                            novelUrl,
                            chapterUrl
                        ).then((res) => {
                            setChapter(res);
                            setLoading(false);
                        });
                    } else {
                        // console.log("Already Downloaded");
                        getChapterFromDB();
                    }
                    checkIfInHistory();
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    const getChapterFromDB = () => {
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM DownloadsTable WHERE chapterUrl = ?`,
                [chapterUrl],
                (tx, results) => {
                    setChapter(results.rows.item(0));
                    setLoading(false);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    useEffect(() => {
        checkIfDownloaded();
    }, []);

    const isCloseToBottom = ({
        layoutMeasurement,
        contentOffset,
        contentSize,
    }) => {
        const paddingToBottom = 0;
        return (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        );
    };

    return (
        <Provider>
            <CollapsibleHeaderScrollView
                headerContainerBackgroundColor={"rgba(0,0,0,0.4)"}
                CollapsibleHeaderComponent={
                    <Appbar.Header
                        style={{
                            backgroundColor: "transparent",
                            elevation: 0,
                        }}
                    >
                        <Appbar.BackAction
                            onPress={() => {
                                // navigation.navigate("NovelItem", {
                                //     novelUrl,
                                //     extensionId,
                                //     navigatingFrom: 0,
                                // });
                                navigation.goBack();
                            }}
                            color={"white"}
                            size={26}
                            style={{ marginRight: 0 }}
                        />
                        <Appbar.Content
                            title={loading ? "Chapter" : chapter.chapterName}
                            titleStyle={{ color: theme.textColorPrimaryDark }}
                        />
                        {!loading && (
                            <>
                                <Appbar.Action
                                    icon="chevron-left"
                                    size={26}
                                    disabled={!chapter.prevChapter}
                                    onPress={() => {
                                        navigation.push("ChapterItem", {
                                            chapterUrl: chapter.prevChapter,
                                            extensionId,
                                            novelUrl,
                                            chapterName: chapter.chapterName,
                                        });
                                    }}
                                    color={"white"}
                                />
                                <Appbar.Action
                                    icon="chevron-right"
                                    size={26}
                                    disabled={!chapter.nextChapter}
                                    onPress={() => {
                                        navigation.push("ChapterItem", {
                                            chapterUrl: chapter.nextChapter,
                                            extensionId,
                                            novelUrl,
                                            chapterName: chapter.chapterName,
                                        });
                                    }}
                                    color={"white"}
                                />
                                <Appbar.Action
                                    icon="dots-vertical"
                                    size={26}
                                    onPress={() =>
                                        _panel.show({ velocity: -1.5 })
                                    }
                                    color={"white"}
                                />
                            </>
                        )}
                    </Appbar.Header>
                }
                headerHeight={100}
                contentContainerStyle={[
                    styles.container,
                    readerTheme === 1 && {
                        backgroundColor: theme.colorDarkPrimary,
                    },
                    readerTheme === 2 && {
                        backgroundColor: "white",
                    },
                    readerTheme === 3 && {
                        backgroundColor: "#F4ECD8",
                    },
                ]}
                onScroll={({ nativeEvent }) => {
                    _panel.hide();
                    if (isCloseToBottom(nativeEvent)) {
                        // console.log("Scroll End Reached");
                        setRead();
                    }
                }}
            >
                {/* <Button mode="contained" onPress={() => setHistory()}>
                    Set History
                </Button> */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ActivityIndicator
                            size="large"
                            color={theme.colorAccentDark}
                        />
                    </View>
                ) : (
                    <>
                        <Text
                            style={[
                                {
                                    paddingVertical: 15,
                                    fontSize: size,
                                },
                                readerTheme === 1
                                    ? { color: theme.textColorSecondaryDark }
                                    : { color: "black" },
                                size === 16
                                    ? { lineHeight: 25 }
                                    : size === 20
                                    ? { lineHeight: 28 }
                                    : size === 12 && { lineHeight: 20 },
                            ]}
                        >
                            {chapter.chapterText.trim()}
                        </Text>
                    </>
                )}
                <Portal>
                    <BottomSheet
                        bottomSheetRef={(c) => (_panel = c)}
                        setSize={setSize}
                        size={size}
                        setReaderTheme={setReaderTheme}
                        readerTheme={readerTheme}
                    />
                </Portal>
            </CollapsibleHeaderScrollView>
        </Provider>
    );
};

export default ChapterItem;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        // backgroundColor: "#202125",
        // backgroundColor: "#000000",
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
});

import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";

import { Appbar, Provider, Portal } from "react-native-paper";
import { theme } from "../../theme/theme";
import { CollapsibleHeaderScrollView } from "react-native-collapsible-header-views";

import BottomSheet from "./components/BottomSheet";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

import { fetchChapterFromSource } from "../../services/api";

import { getReaderTheme } from "../../services/asyncStorage";

import { updateNovelHistory } from "../../redux/actions/history";

import { connect } from "react-redux";

const ChapterItem = ({ route, navigation, theme, updateNovelHistory }) => {
    const { extensionId, chapterUrl, novelUrl, chapterName } = route.params;

    const [loading, setLoading] = useState(true);

    const [chapter, setChapter] = useState();

    const [size, setSize] = useState(16);

    const [readerTheme, setReaderTheme] = useState(1);

    let _panel = useRef(null); // Bottomsheet ref

    getReaderTheme().then((value) => setReaderTheme(value));

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

    const checkIfDownloaded = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM DownloadsTable WHERE chapterUrl=? AND novelUrl=?",
                [chapterUrl, novelUrl],
                (txObj, res) => {
                    if (res.rows.length === 0) {
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
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
        updateNovelHistory(chapterUrl, chapterName, novelUrl);
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
                            onPress={() => navigation.goBack()}
                            color={"white"}
                            size={26}
                            style={{ marginRight: 0 }}
                        />
                        <Appbar.Content
                            title={loading ? "Chapter" : chapter.chapterName}
                            titleStyle={{ color: theme.textColorPrimary }}
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
                        backgroundColor: theme.colorPrimary,
                    },
                    readerTheme === 2 && {
                        backgroundColor: "white",
                    },
                    readerTheme === 3 && {
                        backgroundColor: "#F4ECD8",
                    },
                ]}
                onScroll={({ nativeEvent }) => {
                    // _panel.hide();
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
                            size={50}
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
                                    ? { color: theme.textColorSecondary }
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
                        bottomSheetRef={_panel}
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

const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
});

export default connect(mapStateToProps, { updateNovelHistory })(ChapterItem);

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
});

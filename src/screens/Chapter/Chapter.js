import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";

import { Appbar, Provider, Portal } from "react-native-paper";
import { CollapsibleHeaderScrollView } from "react-native-collapsible-header-views";

import BottomSheet from "./components/BottomSheet";

import { getReaderTheme } from "../../services/asyncStorage";

import { updateNovelHistory } from "../../redux/actions/history";
import { getChapter, updateChapterRead } from "../../redux/actions/novel";

import { connect } from "react-redux";

const ChapterItem = ({
    route,
    navigation,
    theme,
    updateNovelHistory,
    updateChapterRead,
    getChapter,
    chapter,
    loading,
}) => {
    const { extensionId, chapterUrl, novelUrl, chapterName } = route.params;

    const [size, setSize] = useState(16);

    const [readerTheme, setReaderTheme] = useState(1);

    let _panel = useRef(null); // Bottomsheet ref

    getReaderTheme().then((value) => setReaderTheme(value));

    useEffect(() => {
        getChapter(extensionId, chapterUrl, novelUrl);
        updateNovelHistory(chapterUrl, chapterName, novelUrl);
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
                                        _panel.current.show({ velocity: -1.5 })
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
                    if (isCloseToBottom(nativeEvent)) {
                        updateChapterRead(chapterUrl, novelUrl);
                    }
                }}
            >
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ActivityIndicator
                            size={50}
                            color={theme.colorAccentDark}
                        />
                    </View>
                ) : (
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
    chapter: state.novelReducer.chapter,
    loading: state.novelReducer.chapterLoading,
});

export default connect(mapStateToProps, {
    updateNovelHistory,
    updateChapterRead,
    getChapter,
})(ChapterItem);

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
});

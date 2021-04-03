import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";

import { Appbar, Provider, Portal } from "react-native-paper";
import { CollapsibleHeaderScrollView } from "react-native-collapsible-header-views";

import BottomSheet from "./components/BottomSheet";

import { insertHistoryAction } from "../../redux/history/history.actions";
import {
    getChapterAction,
    markChapterReadAction,
} from "../../redux/novel/novel.actions";

import { connect } from "react-redux";

const ChapterItem = ({
    route,
    navigation,
    theme,
    insertHistoryAction,
    markChapterReadAction,
    getChapterAction,
    chapter,
    loading,
    reader,
}) => {
    const {
        chapterId,
        extensionId,
        chapterUrl,
        novelUrl,
        novelId,
    } = route.params;

    let _panel = useRef(null);

    useEffect(() => {
        getChapterAction(extensionId, chapterUrl, novelUrl, chapterId);
        insertHistoryAction(novelId, chapterId);
    }, []);

    const readerBackground = (val) => {
        const backgroundColor = {
            1: "#000000",
            2: "#FFFFFF",
            3: "#F4ECD8",
        };

        return backgroundColor[val];
    };

    const readerTextColor = (val) => {
        const textColor = val === 1 ? "rgba(255,255,255,0.7)" : "#000000";

        return textColor;
    };

    const readerLineHeight = (val) => {
        const lineHeight = {
            12: 20,
            16: 25,
            20: 28,
        };
        return lineHeight[val];
    };

    const isCloseToBottom = ({
        layoutMeasurement,
        contentOffset,
        contentSize,
    }) => {
        const paddingToBottom = 40;
        return (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        );
    };

    return (
        <Provider>
            <CollapsibleHeaderScrollView
                headerContainerBackgroundColor="rgba(0,0,0,0.4)"
                CollapsibleHeaderComponent={
                    <Appbar.Header
                        style={{
                            backgroundColor: "transparent",
                            elevation: 0,
                        }}
                    >
                        <Appbar.BackAction
                            onPress={() => navigation.goBack()}
                            color="#FFFFFF"
                            size={26}
                            style={{ marginRight: 0 }}
                        />
                        <Appbar.Content
                            title={loading ? "Chapter" : chapter.chapterName}
                            titleStyle={{ color: "#FFFFFF" }}
                        />
                        {!loading && (
                            <>
                                <Appbar.Action
                                    icon="chevron-left"
                                    size={26}
                                    disabled={!chapter.prevChapter}
                                    onPress={() => {
                                        navigation.replace("ChapterItem", {
                                            chapterUrl: chapter.prevChapter,
                                            chapterId: chapterId - 1,
                                            extensionId,
                                            novelUrl,
                                            novelId,
                                            chapterName: chapter.chapterName,
                                        });
                                    }}
                                    color="#FFFFFF"
                                />
                                <Appbar.Action
                                    icon="chevron-right"
                                    size={26}
                                    disabled={!chapter.nextChapter}
                                    onPress={() => {
                                        navigation.replace("ChapterItem", {
                                            chapterUrl: chapter.nextChapter,
                                            extensionId,
                                            novelUrl,
                                            novelId,
                                            chapterId: chapterId + 1,
                                            chapterName: chapter.chapterName,
                                        });
                                    }}
                                    color="#FFFFFF"
                                />
                                <Appbar.Action
                                    icon="dots-vertical"
                                    size={26}
                                    onPress={() =>
                                        _panel.current.show({ velocity: -1.5 })
                                    }
                                    color="#FFFFFF"
                                />
                            </>
                        )}
                    </Appbar.Header>
                }
                headerHeight={100}
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: readerBackground(reader.theme) },
                ]}
                onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent)) {
                        markChapterReadAction(chapterId);
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
                                fontSize: reader.textSize,
                                color: readerTextColor(reader.theme),
                                lineHeight: readerLineHeight(reader.textSize),
                            },
                        ]}
                    >
                        {chapter.chapterText.trim()}
                    </Text>
                )}
                <Portal>
                    <BottomSheet bottomSheetRef={_panel} />
                </Portal>
            </CollapsibleHeaderScrollView>
        </Provider>
    );
};

const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
    chapter: state.novelReducer.chapter,
    loading: state.novelReducer.chapterLoading,
    reader: state.settingsReducer.reader,
});

export default connect(mapStateToProps, {
    insertHistoryAction,
    markChapterReadAction,
    getChapterAction,
})(ChapterItem);

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
});

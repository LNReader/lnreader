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

import { connect, useSelector, useDispatch } from "react-redux";
import { parseChapterNumber } from "../../services/updates";
import { updateChaptersRead } from "../../redux/tracker/tracker.actions";

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

    const dispatch = useDispatch();

    const trackedNovels = useSelector(
        (state) => state.trackerReducer.trackedNovels
    );
    const tracker = useSelector((state) => state.trackerReducer.tracker);

    let isTracked = false;

    if (!loading) {
        isTracked = trackedNovels.find((obj) => obj.novelId === novelId);
    }

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

    const chapterNumber = !loading && parseChapterNumber(chapter.chapterName);

    const readerLineHeight = (val) => {
        const lineHeight = {
            12: 20,
            14: 22,
            16: 25,
            18: 26,
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

    // !loading && parseChapterNumber(chapter.chapterName);

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
                        if (
                            isTracked &&
                            chapterNumber &&
                            chapterNumber >
                                isTracked.my_list_status.num_chapters_read
                        ) {
                            dispatch(
                                updateChaptersRead(
                                    isTracked.id,
                                    tracker.access_token,
                                    chapterNumber
                                )
                            );
                        }
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
                                textAlign: reader.textAlign,
                                paddingHorizontal: `${reader.padding}%`,
                            },
                            reader.fontFamily && {
                                fontFamily: reader.fontFamily,
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
        paddingVertical: 10,
    },
});

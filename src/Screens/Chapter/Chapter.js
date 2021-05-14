import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import Constants from "expo-constants";

import { Appbar, Portal } from "react-native-paper";
import { CollapsibleHeaderScrollView } from "react-native-collapsible-header-views";

import ReaderSheet from "./components/ReaderSheet";

import { insertHistoryAction } from "../../redux/history/history.actions";
import {
    getChapterAction,
    saveScrollPosition,
} from "../../redux/chapter/chapter.actions";
import { markChapterReadAction } from "../../redux/novel/novel.actions";
import { updateChaptersRead } from "../../redux/tracker/tracker.actions";

import { useDispatch } from "react-redux";
import { parseChapterNumber } from "../../Services/updates";
import {
    useChapter,
    useReaderSettings,
    useTheme,
    useTrackingStatus,
} from "../../Hooks/reduxHooks";
import {
    readerBackground,
    readerLineHeight,
    readerTextColor,
} from "./readerStyleController";

const Chapter = ({ route, navigation }) => {
    const { chapterId, sourceId, chapterUrl, novelUrl, novelId, position } =
        route.params;
    let readerSheetRef = useRef(null);

    const theme = useTheme();
    const reader = useReaderSettings();
    const dispatch = useDispatch();
    const { tracker, trackedNovels } = useTrackingStatus();

    const isTracked = trackedNovels.find((obj) => obj.novelId === novelId);

    const { chapter, loading } = useChapter();

    const [scrollPercentage, setScrollPercentage] = useState(0);

    useEffect(() => {
        dispatch(getChapterAction(sourceId, novelUrl, chapterUrl, chapterId));
        dispatch(insertHistoryAction(novelId, chapterId));
    }, []);

    let chapterNumber;

    if (!loading) {
        chapterNumber = parseChapterNumber(chapter.chapterName);
    }

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

    const updateTracker = () =>
        isTracked &&
        chapterNumber &&
        chapterNumber > isTracked.my_list_status.num_chapters_read &&
        dispatch(
            updateChaptersRead(
                isTracked.id,
                tracker.access_token,
                chapterNumber
            )
        );

    const navigateToPreviousChapter = () =>
        navigation.replace("Chapter", {
            chapterUrl: chapter.prevChapter,
            chapterId: chapterId - 1,
            sourceId,
            novelUrl,
            novelId,
            chapterName: chapter.chapterName,
        });

    const navigateToNextChapter = () =>
        navigation.replace("Chapter", {
            chapterUrl: chapter.nextChapter,
            sourceId,
            novelUrl,
            novelId,
            chapterId: chapterId + 1,
            chapterName: chapter.chapterName,
        });

    const readerStyles = [
        {
            paddingVertical: 16,
            paddingBottom: 32,
            fontSize: reader.textSize,
            color: readerTextColor(reader.theme),
            lineHeight: readerLineHeight(reader.textSize),
            textAlign: reader.textAlign,
            paddingHorizontal: `${reader.padding}%`,
        },
        reader.fontFamily && {
            fontFamily: reader.fontFamily,
        },
    ];

    const onScroll = ({ nativeEvent }) => {
        const position =
            nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height;

        const percentage = Math.round(
            (position / nativeEvent.contentSize.height) * 100
        );

        setScrollPercentage(percentage);
        dispatch(saveScrollPosition(position, percentage, chapterId, novelId));

        if (isCloseToBottom(nativeEvent)) {
            dispatch(markChapterReadAction(chapterId, novelId));
            updateTracker();
        }
    };

    return (
        <>
            <CollapsibleHeaderScrollView
                headerContainerBackgroundColor="rgba(0,0,0,0.4)"
                CollapsibleHeaderComponent={
                    <Appbar.Header
                        style={{ backgroundColor: "transparent", elevation: 0 }}
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
                                    onPress={navigateToPreviousChapter}
                                    color="#FFFFFF"
                                />
                                <Appbar.Action
                                    icon="chevron-right"
                                    size={26}
                                    disabled={!chapter.nextChapter}
                                    onPress={navigateToNextChapter}
                                    color="#FFFFFF"
                                />
                            </>
                        )}
                        <Appbar.Action
                            icon="dots-vertical"
                            size={26}
                            onPress={() => readerSheetRef.current.show()}
                            color="#FFFFFF"
                        />
                    </Appbar.Header>
                }
                headerHeight={Constants.statusBarHeight + 60}
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: readerBackground(reader.theme) },
                ]}
                onScroll={onScroll}
            >
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ActivityIndicator
                            size={50}
                            color={theme.colorAccent}
                        />
                    </View>
                ) : (
                    <Text style={readerStyles}>
                        {chapter.chapterText.trim()}
                    </Text>
                )}
                <Portal>
                    <ReaderSheet
                        theme={theme}
                        reader={reader}
                        dispatch={dispatch}
                        bottomSheetRef={readerSheetRef}
                    />
                </Portal>
            </CollapsibleHeaderScrollView>
            <Text
                style={[
                    styles.scrollPercentage,
                    { color: readerTextColor(reader.theme) },
                ]}
            >
                {scrollPercentage + "%"}
            </Text>
        </>
    );
};

export default Chapter;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingVertical: 10,
    },
    scrollPercentage: {
        position: "absolute",
        bottom: 12,
        alignSelf: "center",
        fontFamily: "noto-sans",
        fontWeight: "bold",
        zIndex: 1,
    },
});

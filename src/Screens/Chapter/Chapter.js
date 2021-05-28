import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    Button,
} from "react-native";

import { useDispatch } from "react-redux";
import Constants from "expo-constants";
import { Portal } from "react-native-paper";
import { CollapsibleHeaderScrollView } from "react-native-collapsible-header-views";

import { getChapterFromDB } from "../../Database/queries/ChapterQueries";
import { fetchChapter } from "../../Services/Source/source";
import { showToast } from "../../Hooks/showToast";
import {
    usePosition,
    useReaderSettings,
    useTheme,
    useTrackingStatus,
} from "../../Hooks/reduxHooks";
import { updateChaptersRead } from "../../redux/tracker/tracker.actions";
import { insertHistoryAction } from "../../redux/history/history.actions";
import {
    readerBackground,
    readerLineHeight,
    readerTextColor,
} from "./readerStyleController";
import { markChapterReadAction } from "../../redux/novel/novel.actions";
import { saveScrollPosition } from "../../redux/preferences/preference.actions";
import { parseChapterNumber } from "../../Services/updates";

import ChapterAppbar from "./components/ChapterAppbar";
import ReaderSheet from "./components/ReaderSheet";

const Chapter = ({ route, navigation }) => {
    const {
        sourceId,
        chapterId,
        chapterUrl,
        novelId,
        novelUrl,
        novelName,
        chapterName,
    } = route.params;
    let scrollViewRef;
    let readerSheetRef = useRef(null);

    const theme = useTheme();
    const dispatch = useDispatch();
    const reader = useReaderSettings();
    const { tracker, trackedNovels } = useTrackingStatus();
    const position = usePosition(novelId, chapterId);

    const isTracked = trackedNovels.find((obj) => obj.novelId === novelId);

    const [chapter, setChapter] = useState({});
    const [loading, setLoading] = useState(true);

    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [firstLayout, setFirstLayout] = useState(true);

    const getChapter = async (chapterId) => {
        try {
            if (chapterId) {
                const chapterDownloaded = await getChapterFromDB(chapterId);

                if (chapterDownloaded) {
                    setChapter(chapterDownloaded);
                } else {
                    const res = await fetchChapter(
                        sourceId,
                        novelUrl,
                        chapterUrl
                    );
                    setChapter(res);
                }
            } else {
                const res = await fetchChapter(sourceId, novelUrl, chapterUrl);
                setChapter(res);
            }

            setLoading(false);
        } catch (error) {
            showToast(error.message);
        }
    };

    useEffect(() => {
        getChapter(chapterId);
        dispatch(insertHistoryAction(novelId, chapterId));
    }, []);

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

    const updateTracker = () => {
        const chapterNumber = parseChapterNumber(chapterName);

        isTracked &&
            chapterNumber &&
            Number.isInteger(chapterNumber) &&
            chapterNumber > isTracked.my_list_status.num_chapters_read &&
            dispatch(
                updateChaptersRead(
                    isTracked.id,
                    tracker.access_token,
                    chapterNumber
                )
            );
    };

    const onScroll = ({ nativeEvent }) => {
        const offsetY = nativeEvent.contentOffset.y;
        const position =
            nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height;

        const percentage = Math.round(
            (position / nativeEvent.contentSize.height) * 100
        );

        setScrollPercentage(percentage);
        dispatch(saveScrollPosition(offsetY, percentage, chapterId, novelId));

        if (isCloseToBottom(nativeEvent)) {
            dispatch(markChapterReadAction(chapterId, novelId));
            updateTracker();
        }
    };

    const scrollToSavedProgress = () => {
        if (position && firstLayout) {
            position.percentage < 100 &&
                scrollViewRef.getNode().scrollTo({
                    x: 0,
                    y: position.position,
                    animated: false,
                });
            setFirstLayout(false);
        }
    };

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

    return (
        <>
            <CollapsibleHeaderScrollView
                headerContainerBackgroundColor="rgba(0,0,0,0.4)"
                ref={(ref) => (scrollViewRef = ref)}
                CollapsibleHeaderComponent={
                    <ChapterAppbar
                        navigation={navigation}
                        sourceId={sourceId}
                        novelId={novelId}
                        novelUrl={novelUrl}
                        novelName={novelName}
                        chapterName={chapterName}
                        chapterId={chapterId}
                        chapter={chapter}
                        theme={theme}
                        readerSheetRef={readerSheetRef}
                    />
                }
                headerHeight={Constants.statusBarHeight + 56}
                contentContainerStyle={[
                    styles.screenContainer,
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
                    <Text
                        style={readerStyles}
                        onLayout={scrollToSavedProgress}
                        selectable={true}
                    >
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
    screenContainer: {
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

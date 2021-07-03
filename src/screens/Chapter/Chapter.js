import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    StatusBar,
    ScrollView,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { IconButton, Portal } from "react-native-paper";
import {
    hideNavigationBar,
    showNavigationBar,
} from "react-native-navigation-bar-color";

import {
    getChapterFromDB,
    getNextChapterFromDB,
    getPrevChapterFromDB,
} from "../../database/queries/ChapterQueries";
import { fetchChapter } from "../../services/Source/source";
import { showToast } from "../../hooks/showToast";
import {
    usePosition,
    useReaderSettings,
    useSettings,
    useTheme,
    useTrackingStatus,
} from "../../hooks/reduxHooks";
import { updateChaptersRead } from "../../redux/tracker/tracker.actions";
import { insertHistoryAction } from "../../redux/history/history.actions";
import {
    errorTextColor,
    readerBackground,
    readerLineHeight,
    readerTextColor,
} from "./readerStyleController";
import { markChapterReadAction } from "../../redux/novel/novel.actions";
import { saveScrollPosition } from "../../redux/preferences/preference.actions";
import { parseChapterNumber } from "../../services/updates";

import ChapterAppbar from "./components/ChapterAppbar";
import ReaderSheet from "./components/ReaderSheet";
import EmptyView from "../../components/EmptyView";
import FitImage from "react-native-fit-image";

import ChapterFooter from "./components/ChapterFooter";
import VerticalScrollbar from "./components/VerticalScrollbar";
import GestureRecognizer from "react-native-swipe-gestures";

const Chapter = ({ route, navigation }) => {
    const {
        sourceId,
        chapterId,
        chapterUrl,
        novelId,
        novelUrl,
        novelName,
        chapterName,
        bookmark,
    } = route.params;
    let scrollViewRef = useRef(null);
    let readerSheetRef = useRef(null);

    const theme = useTheme();
    const dispatch = useDispatch();
    const reader = useReaderSettings();
    const showScrollPercentage = useSelector(
        (state) => state.settingsReducer.showScrollPercentage
    );
    const {
        swipeGestures = true,
        incognitoMode = false,
        textSelectable = false,
    } = useSettings();

    const [hidden, setHidden] = useState(true);

    const { tracker, trackedNovels } = useTrackingStatus();
    const position = usePosition(novelId, chapterId);

    const isTracked = trackedNovels.find((obj) => obj.novelId === novelId);

    const [chapter, setChapter] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [firstLayout, setFirstLayout] = useState(true);

    const [contentSize, setContentSize] = useState(0);

    const [images, setImages] = useState([]);

    const getChapter = async (chapterId) => {
        try {
            if (chapterId) {
                const chapterDownloaded = await getChapterFromDB(chapterId);

                if (chapterDownloaded) {
                    setChapter(chapterDownloaded);
                    parseImages(chapterDownloaded.chapterText);
                } else {
                    const res = await fetchChapter(
                        sourceId,
                        novelUrl,
                        chapterUrl
                    );
                    parseImages(res.chapterText);
                    setChapter(res);
                }
            } else {
                const res = await fetchChapter(sourceId, novelUrl, chapterUrl);
                parseImages(res.chapterText);
                setChapter(res);
            }

            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
            showToast(error.message);
        }
    };

    const parseImages = (chapterText) => {
        let imageLinks = chapterText.match(/\[https.*?\]/g, "");
        let chapterTextWithoutLinks;

        if (imageLinks) {
            imageLinks = imageLinks.map((link) => link.slice(1, -1));

            setImages(imageLinks);
        }
    };

    const [nextChapter, setNextChapter] = useState({});
    const [prevChapter, setPrevChapter] = useState({});

    const setPrevAndNextChap = async () => {
        const nextChap = await getNextChapterFromDB(novelId, chapterId);
        const prevChap = await getPrevChapterFromDB(novelId, chapterId);

        setNextChapter(nextChap);
        setPrevChapter(prevChap);
    };

    useEffect(() => {
        getChapter(chapterId);
        setPrevAndNextChap();
        !incognitoMode && dispatch(insertHistoryAction(novelId, chapterId));
        return () => {
            StatusBar.setHidden(false);
            showNavigationBar();
        };
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

        if (!incognitoMode) {
            dispatch(
                saveScrollPosition(offsetY, percentage, chapterId, novelId)
            );
        }

        if (!incognitoMode && isCloseToBottom(nativeEvent)) {
            dispatch(markChapterReadAction(chapterId, novelId));
            updateTracker();
        }
    };

    const scrollToSavedProgress = (event) => {
        StatusBar.setHidden(true);
        hideNavigationBar();
        if (position && firstLayout) {
            position.percentage < 100 &&
                scrollViewRef.current.scrollTo({
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
            color: reader.textColor || readerTextColor(reader.theme),
            lineHeight: readerLineHeight(reader.textSize, reader.lineHeight),
            textAlign: reader.textAlign,
            paddingHorizontal: `${reader.padding}%`,
        },
        reader.fontFamily && {
            fontFamily: reader.fontFamily,
        },
    ];

    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
    };

    const navigateToPrevChapter = () =>
        prevChapter
            ? navigation.replace("Chapter", {
                  chapterUrl: prevChapter.chapterUrl,
                  chapterId: prevChapter.chapterId,
                  sourceId,
                  novelUrl,
                  novelId,
                  chapterName: prevChapter.chapterName,
                  novelName,
                  bookmark: prevChapter.bookmark,
              })
            : showToast("'There's no previous chapter");

    const navigateToNextChapter = () =>
        nextChapter
            ? navigation.replace("Chapter", {
                  chapterUrl: nextChapter.chapterUrl,
                  sourceId,
                  novelUrl,
                  novelId,
                  chapterId: nextChapter.chapterId,
                  chapterName: nextChapter.chapterName,
                  novelName,
                  bookmark: nextChapter.bookmark,
              })
            : showToast("'There's no next chapter");

    return (
        <>
            <ChapterAppbar
                novelName={novelName}
                chapterName={chapterName}
                chapterId={chapterId}
                bookmark={bookmark}
                readerSheetRef={readerSheetRef}
                hide={hidden}
                navigation={navigation}
                dispatch={dispatch}
            />
            <ScrollView
                ref={(ref) => (scrollViewRef.current = ref)}
                contentContainerStyle={[
                    styles.screenContainer,
                    { backgroundColor: readerBackground(reader.theme) },
                ]}
                onScroll={onScroll}
                onContentSizeChange={(x, y) => setContentSize(y)}
                showsVerticalScrollIndicator={false}
            >
                <GestureRecognizer
                    onSwipeRight={swipeGestures && navigateToPrevChapter}
                    onSwipeLeft={swipeGestures && navigateToNextChapter}
                    config={config}
                    style={{ flex: 1 }}
                >
                    {error ? (
                        <View style={{ flex: 1, justifyContent: "center" }}>
                            <EmptyView
                                icon="(-_-;)・・・"
                                description={error}
                                style={{ color: errorTextColor(reader.theme) }}
                            >
                                <IconButton
                                    icon="reload"
                                    size={25}
                                    style={{ margin: 0, marginTop: 16 }}
                                    color={errorTextColor(reader.theme)}
                                    onPress={() => {
                                        getChapter(chapterId);
                                        setLoading(true);
                                        setError();
                                    }}
                                />
                                <Text
                                    style={{
                                        color: errorTextColor(reader.theme),
                                    }}
                                >
                                    Retry
                                </Text>
                            </EmptyView>
                        </View>
                    ) : loading ? (
                        <View style={{ flex: 1, justifyContent: "center" }}>
                            <ActivityIndicator
                                size={50}
                                color={theme.colorAccent}
                            />
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            {images.length > 0 &&
                                images.map((image, index) => (
                                    <FitImage
                                        source={{ uri: image }}
                                        key={index}
                                    />
                                ))}

                            <Text
                                style={readerStyles}
                                onLayout={scrollToSavedProgress}
                                selectable={textSelectable}
                                onPress={() => setHidden(!hidden)}
                            >
                                {chapter.chapterText
                                    .trim()
                                    .replace(/\[https.*?\]/g, "")}
                            </Text>
                        </View>
                    )}
                </GestureRecognizer>
                <Portal>
                    <ReaderSheet
                        theme={theme}
                        reader={reader}
                        dispatch={dispatch}
                        bottomSheetRef={readerSheetRef}
                        selectText={textSelectable}
                        showScrollPercentage={showScrollPercentage}
                    />
                </Portal>
            </ScrollView>
            <VerticalScrollbar
                theme={theme}
                hide={hidden}
                setLoading={setLoading}
                contentSize={contentSize}
                scrollViewRef={scrollViewRef}
                scrollPercentage={scrollPercentage}
                setScrollPercentage={setScrollPercentage}
            />
            <ChapterFooter
                theme={theme}
                swipeGestures={swipeGestures}
                dispatch={dispatch}
                nextChapter={nextChapter}
                prevChapter={prevChapter}
                hide={hidden}
                navigateToNextChapter={navigateToNextChapter}
                navigateToPrevChapter={navigateToPrevChapter}
                readerSheetRef={readerSheetRef}
                scrollViewRef={scrollViewRef}
            />
            {showScrollPercentage && (
                <Text
                    style={[
                        styles.scrollPercentage,
                        {
                            color: reader.textColor,
                            backgroundColor: readerBackground(reader.theme),
                        },
                    ]}
                >
                    {scrollPercentage + "%"}
                </Text>
            )}
        </>
    );
};

export default Chapter;

const styles = StyleSheet.create({
    screenContainer: {
        flexGrow: 1,
        paddingTop: StatusBar.currentHeight,
    },
    scrollPercentage: {
        width: "100%",
        position: "absolute",
        bottom: 0,
        height: 30,
        textAlign: "center",
        textAlignVertical: "center",
        alignSelf: "center",
        fontFamily: "noto-sans",
        fontWeight: "bold",
        zIndex: 1,
    },
});

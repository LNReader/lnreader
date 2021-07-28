import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    ScrollView,
    TouchableWithoutFeedback,
    Dimensions,
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
import {
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

import ChapterFooter from "./components/ChapterFooter";
import VerticalScrollbar from "./components/VerticalScrollbar";
import GestureRecognizer from "react-native-swipe-gestures";
import TextToComponents from "./TextToComponent";
import { LoadingScreen } from "../../components/LoadingScreen/LoadingScreen";
import { insertHistory } from "../../database/queries/HistoryQueries";
import { SET_LAST_READ } from "../../redux/preferences/preference.types";
import WebView from "react-native-webview";

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
        useWebViewForChapter = false,
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
            setError(error.message);
            setLoading(false);
            showToast(error.message);
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
        if (!incognitoMode) {
            insertHistory(novelId, chapterId);
            dispatch({
                type: SET_LAST_READ,
                payload: { novelId, chapterId },
            });
        }
        return () => {
            StatusBar.setHidden(false);
            showNavigationBar();
        };
    }, []);

    useEffect(() => {
        setPrevAndNextChap();
    }, [chapter]);

    const isCloseToBottom = useCallback(
        ({ layoutMeasurement, contentOffset, contentSize }) => {
            const paddingToBottom = 40;
            return (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - paddingToBottom
            );
        },
        []
    );

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

    const onScroll = useCallback(({ nativeEvent }) => {
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
    }, []);

    const setImmersiveMode = () => {
        StatusBar.setHidden(true);
        hideNavigationBar();
    };

    const scrollToSavedProgress = useCallback((event) => {
        setImmersiveMode();
        if (position && firstLayout) {
            position.percentage < 100 &&
                scrollViewRef.current.scrollTo({
                    x: 0,
                    y: position.position,
                    animated: false,
                });
            setFirstLayout(false);
        }
    }, []);

    const hideHeader = () => {
        !hidden && setImmersiveMode();
        setHidden(!hidden);
    };

    const readerStyles = [
        {
            fontSize: reader.textSize,
            color: reader.textColor || readerTextColor(reader.theme),
            lineHeight: readerLineHeight(reader.textSize, reader.lineHeight),
            textAlign: reader.textAlign,
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
            : showToast("There's no previous chapter");

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
            : showToast("There's no next chapter");

    const onPressLink = async (link) => {
        setLoading(true);
        const res = await fetchChapter(sourceId, novelUrl, link);
        setChapter(res);
        setLoading(false);
    };

    return (
        <>
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
                    {error ? (
                        <View style={{ flex: 1, justifyContent: "center" }}>
                            <EmptyView
                                icon="Σ(ಠ_ಠ)"
                                description={error}
                                style={{
                                    color:
                                        reader.textColor ||
                                        readerTextColor(reader.theme),
                                }}
                            >
                                <IconButton
                                    icon="reload"
                                    size={25}
                                    style={{ margin: 0, marginTop: 16 }}
                                    color={
                                        reader.textColor ||
                                        readerTextColor(reader.theme)
                                    }
                                    onPress={() => {
                                        getChapter(chapterId);
                                        setLoading(true);
                                        setError();
                                    }}
                                />
                                <Text
                                    style={{
                                        color:
                                            reader.textColor ||
                                            readerTextColor(reader.theme),
                                    }}
                                >
                                    Retry
                                </Text>
                            </EmptyView>
                        </View>
                    ) : loading ? (
                        <LoadingScreen theme={theme} />
                    ) : (
                        <GestureRecognizer
                            onSwipeRight={
                                swipeGestures && navigateToPrevChapter
                            }
                            onSwipeLeft={swipeGestures && navigateToNextChapter}
                            config={config}
                            style={{ flex: 1 }}
                        >
                            <TouchableWithoutFeedback
                                style={{
                                    flex: 1,
                                }}
                                onPress={hideHeader}
                                onLayout={scrollToSavedProgress}
                            >
                                {useWebViewForChapter &&
                                chapter.chapterTextRaw ? (
                                    <WebView
                                        source={{
                                            html: `
                                    <html>
                                        <head>
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                                            <style>
                                                html,body
                                                    {
                                                        overflow-x: hidden;
                                                        padding-top: ${
                                                            StatusBar.currentHeight
                                                        };

                                                    }
                                                body {
                                                    padding-left: ${
                                                        reader.padding
                                                    }%;
                                                    padding-right: ${
                                                        reader.padding
                                                    }%;
                                                    font-size: ${
                                                        reader.textSize
                                                    }px;
                                                    color: ${reader.textColor};
                                                    background-color: ${readerBackground(
                                                        reader.theme
                                                    )};
                                                    text-align: ${
                                                        reader.textAlign
                                                    };
                                                    line-height: ${
                                                        reader.lineHeight
                                                    };
                                                    font-family: ${
                                                        reader.fontFamily
                                                    };
                                                }
                                                a {
                                                    color: ${theme.colorAccent};
                                                }
                                                img {
                                                    display: block;
                                                    width: auto;
                                                    height: auto;
                                                    max-width: ${
                                                        Dimensions.get("window")
                                                            .width -
                                                        10 * reader.padding
                                                    };
                                                }
                                                @font-face {
                                                    font-family: ${
                                                        reader.fontFamily
                                                    };
                                                    src: url('file:///android_asset/fonts/${
                                                        reader.fontFamily
                                                    }.ttf');
                                                }
                                                
                                            </style>
                                            </head>
                                        <body>
                                            ${chapter.chapterTextRaw}
                                        </body>
                                    </html>
                                    `,
                                        }}
                                        onScroll={onScroll}
                                    />
                                ) : (
                                    <View
                                        style={{
                                            flex: 1,
                                            paddingVertical: 16,
                                            paddingBottom: 32,
                                            paddingHorizontal: `${reader.padding}%`,
                                            paddingTop: StatusBar.currentHeight,
                                        }}
                                        onLayout={scrollToSavedProgress}
                                        onPress={hideHeader}
                                    >
                                        <TextToComponents
                                            text={chapter.chapterText}
                                            textStyle={readerStyles}
                                            textSize={reader.textSize}
                                            textColor={
                                                reader.textColor ||
                                                readerTextColor(reader.theme)
                                            }
                                            textSelectable={textSelectable}
                                            onPressLink={onPressLink}
                                            theme={theme}
                                        />
                                    </View>
                                )}
                            </TouchableWithoutFeedback>
                        </GestureRecognizer>
                    )}
                    <Portal>
                        <ReaderSheet
                            theme={theme}
                            reader={reader}
                            dispatch={dispatch}
                            navigation={navigation}
                            bottomSheetRef={readerSheetRef}
                            selectText={textSelectable}
                            useWebViewForChapter={useWebViewForChapter}
                            showScrollPercentage={showScrollPercentage}
                        />
                    </Portal>
                </ScrollView>
                {!useWebViewForChapter && (
                    <VerticalScrollbar
                        theme={theme}
                        hide={hidden}
                        setLoading={setLoading}
                        contentSize={contentSize}
                        scrollViewRef={scrollViewRef}
                        scrollPercentage={scrollPercentage}
                        setScrollPercentage={setScrollPercentage}
                    />
                )}
                <ChapterFooter
                    theme={theme}
                    swipeGestures={swipeGestures}
                    dispatch={dispatch}
                    nextChapter={nextChapter}
                    prevChapter={prevChapter}
                    hide={hidden}
                    useWebViewForChapter={useWebViewForChapter}
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
        </>
    );
};

export default Chapter;

const styles = StyleSheet.create({
    screenContainer: { flexGrow: 1 },
    scrollPercentage: {
        width: "100%",
        position: "absolute",
        bottom: 0,
        height: 30,
        textAlign: "center",
        textAlignVertical: "center",
        alignSelf: "center",
        fontWeight: "bold",
        zIndex: 1,
    },
});

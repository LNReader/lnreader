import React, { useState, useEffect } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import {
    getNextChapterFromDB,
    getPrevChapterFromDB,
} from "../../../Database/queries/ChapterQueries";
import { showToast } from "../../../Hooks/showToast";

const ChapterFooter = ({
    hide,
    sourceId,
    novelId,
    novelUrl,
    chapterId,
    theme,
    readerSheetRef,
    navigation,
    novelName,
    scrollViewRef,
}) => {
    const [nextChapter, setNextChapter] = useState({});
    const [prevChapter, setPrevChapter] = useState({});

    const setPrevAndNextChap = async () => {
        const nextChap = await getNextChapterFromDB(novelId, chapterId);
        const prevChap = await getPrevChapterFromDB(novelId, chapterId);

        setNextChapter(nextChap);
        setPrevChapter(prevChap);
    };

    useEffect(() => {
        setPrevAndNextChap();
    }, []);

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

    if (hide) {
        return null;
    } else {
        return (
            <View
                style={{
                    position: "absolute",
                    zIndex: 2,
                    bottom: 0,
                    width: Dimensions.get("window").width,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    flexDirection: "row",
                }}
            >
                <Pressable
                    android_ripple={{
                        color: theme.rippleColor,
                        borderless: true,
                        radius: 50,
                    }}
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 8,
                    }}
                    onPress={navigateToPrevChapter}
                >
                    <IconButton
                        icon="chevron-left"
                        size={26}
                        disabled={!prevChapter}
                        color="#FFFFFF"
                    />
                </Pressable>
                <Pressable
                    android_ripple={{
                        color: theme.rippleColor,
                        borderless: true,
                        radius: 50,
                    }}
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 8,
                    }}
                    onPress={() => scrollViewRef.current.scrollTo({})}
                >
                    <IconButton
                        icon="format-vertical-align-top"
                        size={26}
                        color="#FFFFFF"
                    />
                </Pressable>
                <Pressable
                    android_ripple={{
                        color: theme.rippleColor,
                        borderless: true,
                        radius: 50,
                    }}
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 8,
                    }}
                    onPress={() => readerSheetRef.current.show()}
                >
                    <IconButton icon="cog-outline" size={26} color="#FFFFFF" />
                </Pressable>
                <Pressable
                    android_ripple={{
                        color: theme.rippleColor,
                        borderless: true,
                        radius: 50,
                    }}
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 8,
                    }}
                    onPress={navigateToNextChapter}
                >
                    <IconButton
                        icon="chevron-right"
                        size={26}
                        disabled={!nextChapter}
                        color="#FFFFFF"
                    />
                </Pressable>
            </View>
        );
    }
};

export default ChapterFooter;

import React, { useEffect, useState } from "react";

import { Appbar } from "react-native-paper";
import {
    getNextChapterFromDB,
    getPrevChapterFromDB,
} from "../../../Database/queries/ChapterQueries";

const ChapterAppbar = ({
    navigation,
    sourceId,
    novelId,
    novelName,
    novelUrl,
    chapterId,
    chapterName,
    theme,
    readerSheetRef,
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
        navigation.replace("Chapter", {
            chapterUrl: prevChapter.chapterUrl,
            chapterId: prevChapter.chapterId,
            sourceId,
            novelUrl,
            novelId,
            chapterName: prevChapter.chapterName,
            novelName,
        });

    const navigateToNextChapter = () =>
        navigation.replace("Chapter", {
            chapterUrl: nextChapter.chapterUrl,
            sourceId,
            novelUrl,
            novelId,
            chapterId: nextChapter.chapterId,
            chapterName: nextChapter.chapterName,
            novelName,
        });

    return (
        <Appbar.Header style={{ backgroundColor: "transparent", elevation: 0 }}>
            <Appbar.BackAction
                onPress={() => navigation.goBack()}
                color="#FFFFFF"
                size={26}
                style={{ marginRight: 0 }}
            />
            <Appbar.Content
                title={novelName}
                titleStyle={{ color: "#FFFFFF" }}
                subtitle={chapterName}
                subtitleStyle={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Appbar.Action
                icon="chevron-left"
                size={26}
                disabled={!prevChapter}
                onPress={navigateToPrevChapter}
                color="#FFFFFF"
            />
            <Appbar.Action
                icon="chevron-right"
                size={26}
                disabled={!nextChapter}
                onPress={navigateToNextChapter}
                color="#FFFFFF"
            />
            <Appbar.Action
                icon="dots-vertical"
                size={26}
                onPress={() => readerSheetRef.current.show()}
                color="#FFFFFF"
            />
        </Appbar.Header>
    );
};

export default ChapterAppbar;

import React, { memo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

import { Row } from "../../../components/Common";

import { parseChapterNumber } from "../../../services/utils/helpers";
import {
    ChapterBookmarkButton,
    DownloadButton,
} from "./Chapter/ChapterDownloadButtons";

const ChapterItem = ({
    novelData,
    chapter,
    theme,
    navigation,
    index,
    position,
    showChapterTitles,
    downloadQueue,
    downloadChapter,
    deleteChapter,
    isSelected,
    onSelectPress,
    onSelectLongPress,
}) => {
    const { sourceId, novelName, novelUrl } = novelData;
    const {
        novelId,
        chapterId,
        chapterUrl,
        chapterName,
        read,
        releaseDate,
        bookmark,
    } = chapter;

    const [deleteChapterMenu, setDeleteChapterMenu] = useState(false);
    const showDeleteChapterMenu = () => setDeleteChapterMenu(true);
    const hideDeleteChapterMenu = () => setDeleteChapterMenu(false);

    const navigateToChapter = () =>
        navigation.navigate("Chapter", {
            sourceId,
            novelUrl,
            novelId,
            chapterId,
            chapterUrl,
            chapterName,
            novelName,
            bookmark,
        });

    const renderProgressPercentage = () => {
        const savedProgress =
            position && position[chapterId] && position[chapterId].percentage;
        if (savedProgress < 100 && savedProgress > 0 && !read) {
            return (
                <Text
                    style={{
                        color: theme.textColorHint,
                        fontSize: 12,
                        marginLeft: releaseDate ? 5 : 0,
                    }}
                    numberOfLines={1}
                >
                    {releaseDate && "•  "}
                    {"Progress " + position[chapterId].percentage + "%"}
                </Text>
            );
        }
    };

    return (
        <Pressable
            style={[
                styles.chapterCardContainer,
                isSelected(chapterId) && {
                    backgroundColor: theme.rippleColor,
                },
            ]}
            onPress={() => onSelectPress(chapter, navigateToChapter)}
            onLongPress={() => onSelectLongPress(chapter)}
            android_ripple={{ color: theme.rippleColor }}
        >
            <Row>
                {bookmark === true && <ChapterBookmarkButton theme={theme} />}
                <View>
                    <Text
                        style={{
                            color: read
                                ? theme.textColorHint
                                : theme.textColorPrimary,
                        }}
                        numberOfLines={1}
                    >
                        {showChapterTitles
                            ? parseChapterNumber(chapterName)
                                ? "Chapter " + parseChapterNumber(chapterName)
                                : "Chapter " + index
                            : chapterName.substring(0, 50)}
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            marginTop: 5,
                        }}
                    >
                        {releaseDate && (
                            <Text
                                style={{
                                    color: read
                                        ? theme.textColorHint
                                        : theme.textColorSecondary,
                                    fontSize: 12,
                                }}
                                numberOfLines={1}
                            >
                                {releaseDate}
                            </Text>
                        )}
                        {renderProgressPercentage()}
                    </View>
                </View>
            </Row>
            <DownloadButton
                downloadQueue={downloadQueue}
                chapter={chapter}
                theme={theme}
                deleteChapter={deleteChapter}
                downloadChapter={downloadChapter}
                hideDeleteChapterMenu={hideDeleteChapterMenu}
                showDeleteChapterMenu={showDeleteChapterMenu}
                deleteChapterMenu={deleteChapterMenu}
            />
        </Pressable>
    );
};

export default memo(ChapterItem);

const styles = StyleSheet.create({
    chapterCardContainer: {
        paddingHorizontal: 15,
        paddingVertical: 7,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});

import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

import { Menu } from "react-native-paper";
import { Row } from "../../../components/Common";

import {
    deleteChapterAction,
    downloadChapterAction,
} from "../../../redux/novel/novel.actions";
import { parseChapterNumber } from "../../../services/utils/helpers";
import {
    ChapterBookmarkButton,
    ChapterDownloadingButton,
    DeleteChapterButton,
    DownloadChapterButton,
} from "./Chapter/ChapterDownloadButtons";

const ChapterItem = ({
    novelUrl,
    novelName,
    chapter,
    sourceId,
    dispatch,
    theme,
    navigation,
    index,
    position,
    selected,
    setSelected,
    showChapterTitles,
    downloadQueue,
}) => {
    const {
        novelId,
        chapterId,
        chapterUrl,
        chapterName,
        read,
        releaseDate,
        bookmark,
        downloaded,
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

    const downloadChapter = useCallback(
        () =>
            dispatch(
                downloadChapterAction(
                    sourceId,
                    novelUrl,
                    chapterUrl,
                    chapterName,
                    chapterId
                )
            ),
        []
    );

    const deleteChapter = () =>
        dispatch(deleteChapterAction(chapterId, chapterName));

    const renderDownloadIcon = () => {
        if (downloadQueue.some((chap) => chap.chapterId === chapterId)) {
            return <ChapterDownloadingButton theme={theme} />;
        } else if (downloaded === 1) {
            return (
                <Menu
                    visible={deleteChapterMenu}
                    onDismiss={hideDeleteChapterMenu}
                    anchor={
                        <DeleteChapterButton
                            theme={theme}
                            onPress={showDeleteChapterMenu}
                        />
                    }
                    contentStyle={{ backgroundColor: theme.menuColor }}
                >
                    <Menu.Item
                        onPress={deleteChapter}
                        title="Delete"
                        titleStyle={{ color: theme.textColorPrimary }}
                    />
                </Menu>
            );
        } else {
            return (
                <DownloadChapterButton
                    theme={theme}
                    onPress={downloadChapter}
                />
            );
        }
    };

    const isSelected = (chapterId) => {
        return selected.some((obj) => obj.chapterId === chapterId);
    };

    const onPress = () => {
        if (selected.length === 0) {
            navigateToChapter();
        } else {
            if (isSelected(chapterId)) {
                setSelected((selected) =>
                    selected.filter((item) => item.chapterId !== chapterId)
                );
            } else {
                setSelected((selected) => [...selected, chapter]);
            }
        }
    };

    const onLongPress = () => {
        if (isSelected(chapterId)) {
            setSelected((selected) =>
                selected.filter((item) => item.chapterId !== chapterId)
            );
        } else {
            setSelected((selected) => [...selected, chapter]);
        }
    };

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
            onPress={onPress}
            onLongPress={onLongPress}
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
            <View>{renderDownloadIcon()}</View>
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

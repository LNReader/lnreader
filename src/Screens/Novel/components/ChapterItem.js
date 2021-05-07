import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { TouchableRipple, IconButton, Menu } from "react-native-paper";

import {
    deleteChapterAction,
    downloadChapterAction,
} from "../../../redux/novel/novel.actions";

const ChapterItem = ({
    novelUrl,
    chapter,
    sourceId,
    dispatch,
    theme,
    navigation,
    downloading,
}) => {
    const [deleteChapterMenu, setDeleteChapterMenu] = useState(false);
    const showDeleteChapterMenu = () => setDeleteChapterMenu(true);
    const hideDeleteChapterMenu = () => setDeleteChapterMenu(false);

    const navigateToChapter = () =>
        navigation.navigate("Chapter", {
            sourceId,
            novelUrl,
            novelId: chapter.novelId,
            chapterId: chapter.chapterId,
            chapterUrl: chapter.chapterUrl,
            chapterName: chapter.chapterName,
        });

    const displayDownloadButton = () => {
        if (downloading.indexOf(chapter.chapterId) !== -1) {
            return (
                <ActivityIndicator
                    color={theme.textColorHint}
                    size={25}
                    style={{ margin: 3.5, padding: 5 }}
                />
            );
        } else if (chapter.downloaded === 1) {
            return (
                <Menu
                    visible={deleteChapterMenu}
                    onDismiss={hideDeleteChapterMenu}
                    anchor={
                        <IconButton
                            icon="check-circle"
                            animated
                            color={theme.textColorPrimary}
                            size={25}
                            onPress={showDeleteChapterMenu}
                            style={{ margin: 2 }}
                        />
                    }
                    contentStyle={{ backgroundColor: theme.menuColor }}
                >
                    <Menu.Item
                        onPress={() =>
                            dispatch(
                                deleteChapterAction(
                                    chapter.chapterId,
                                    chapter.chapterName
                                )
                            )
                        }
                        title="Delete"
                        titleStyle={{ color: theme.textColorPrimary }}
                    />
                </Menu>
            );
        } else {
            return (
                <IconButton
                    icon="arrow-down-circle-outline"
                    animated
                    color={theme.textColorHint}
                    size={25}
                    onPress={() =>
                        dispatch(
                            downloadChapterAction(
                                sourceId,
                                novelUrl,
                                chapter.chapterUrl,
                                chapter.chapterName,
                                chapter.chapterId
                            )
                        )
                    }
                    style={{ margin: 2 }}
                />
            );
        }
    };

    return (
        <TouchableRipple
            style={styles.chapterCardContainer}
            onPress={navigateToChapter}
            rippleColor={theme.rippleColor}
        >
            <>
                <View>
                    <Text
                        style={[
                            { color: theme.textColorPrimary },
                            chapter.read && {
                                color: theme.textColorHint,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {chapter.chapterName.substring(0, 50)}
                    </Text>
                    {chapter.releaseDate && (
                        <Text
                            style={[
                                {
                                    color: theme.textColorSecondary,
                                    marginTop: 5,
                                    fontSize: 12,
                                },
                                chapter.read && {
                                    color: theme.textColorHint,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {chapter.releaseDate}
                        </Text>
                    )}
                </View>
                <View>{displayDownloadButton()}</View>
            </>
        </TouchableRipple>
    );
};

export default ChapterItem;

const styles = StyleSheet.create({
    chapterCardContainer: {
        paddingHorizontal: 15,
        paddingVertical: 7,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});

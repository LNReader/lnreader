import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

import { TouchableRipple, IconButton, Menu } from "react-native-paper";
import * as Haptics from "expo-haptics";

import {
    deleteChapterAction,
    downloadChapterAction,
} from "../../../redux/novel/novel.actions";

const ChapterItem = ({
    novelUrl,
    novelName,
    chapter,
    sourceId,
    dispatch,
    theme,
    navigation,
    downloading,
    position,
    selected,
    setSelected,
    chapterActionsSheetRef,
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
            novelName: novelName,
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

    const bookmarkButton = () => {
        if (chapter.bookmark) {
            return (
                <IconButton
                    icon="bookmark"
                    color={theme.colorAccent}
                    size={18}
                    style={{ marginLeft: 2 }}
                />
            );
        }
    };

    const isSelected = (chapterId) => {
        return selected.some((obj) => obj.chapterId === chapterId);
    };

    return (
        <TouchableRipple
            style={[
                styles.chapterCardContainer,
                isSelected(chapter.chapterId) && {
                    backgroundColor: theme.rippleColor,
                },
            ]}
            onPress={() => {
                if (selected.length === 0) {
                    navigateToChapter();
                } else {
                    if (isSelected(chapter.chapterId)) {
                        setSelected((selected) =>
                            selected.filter(
                                (item) => item.chapterId !== chapter.chapterId
                            )
                        );
                    } else {
                        setSelected((selected) => [...selected, chapter]);
                    }
                }
            }}
            onLongPress={() => {
                if (isSelected(chapter.chapterId)) {
                    setSelected((selected) =>
                        selected.filter(
                            (item) => item.chapterId !== chapter.chapterId
                        )
                    );
                } else {
                    setSelected((selected) => [...selected, chapter]);
                }
                // chapterActionsSheetRef.current.show();
            }}
            rippleColor={theme.rippleColor}
        >
            <>
                <View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        {bookmarkButton()}
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
                            <View
                                style={{
                                    flexDirection: "row",
                                    marginTop: 5,
                                }}
                            >
                                {chapter.releaseDate && (
                                    <Text
                                        style={[
                                            {
                                                color: theme.textColorSecondary,
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
                                {position &&
                                    !chapter.read &&
                                    position[chapter.chapterId] &&
                                    position[chapter.chapterId].percentage <
                                        100 &&
                                    position[chapter.chapterId].percentage >
                                        0 && (
                                        <Text
                                            style={[
                                                {
                                                    color: theme.textColorHint,
                                                    fontSize: 12,
                                                    marginLeft: 0,
                                                },
                                                chapter.releaseDate && {
                                                    marginLeft: 5,
                                                },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {position[chapter.chapterId]
                                                .percentage + "%"}
                                        </Text>
                                    )}
                            </View>
                        </View>
                    </View>
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

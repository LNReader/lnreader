import React from "react";
import { Pressable, StyleSheet, View, Image, Text } from "react-native";

import moment from "moment";
import { IconButton } from "react-native-paper";

import { parseChapterNumber } from "../../services/utils/helpers";
import { deleteHistoryAction } from "../../redux/history/history.actions";
import { setNovel } from "../../redux/novel/novel.actions";

const HistoryItem = ({ history, theme, dispatch, navigation }) => {
    const {
        historyId,
        historyTimeRead,
        historyChapterId,
        sourceId,
        novelId,
        novelUrl,
        novelName,
        novelCover,
        chapterName,
        chapterUrl,
        bookmark,
    } = history;

    const getChapterNumber = () =>
        `Ch. ${parseChapterNumber(chapterName)} - ${moment(historyTimeRead)
            .format("h:mm a")
            .toUpperCase()}`;

    const navigateToNovel = () => {
        navigation.navigate("Novel", history);
        dispatch(setNovel(history));
    };

    const navigateToChapter = () =>
        navigation.navigate("Chapter", {
            chapterId: historyChapterId,
            chapterUrl,
            sourceId,
            novelUrl,
            novelId,
            chapterName,
            novelName,
            bookmark,
        });

    return (
        <Pressable
            onPress={navigateToNovel}
            android_ripple={{ color: theme.rippleColor }}
            style={styles.pressable}
        >
            <View style={styles.historyItemContainer}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        overflow: "hidden",
                    }}
                >
                    <View>
                        <Image
                            source={{ uri: novelCover }}
                            style={styles.historyItemCover}
                        />
                    </View>
                    <View
                        style={{
                            flexShrink: 1,
                            marginLeft: 16,
                            justifyContent: "center",
                        }}
                    >
                        <Text
                            style={[
                                { color: theme.textColorPrimary },
                                styles.historyItemTitle,
                            ]}
                            numberOfLines={2}
                        >
                            {novelName}
                        </Text>
                        <Text
                            style={{
                                color: theme.textColorSecondary,
                                marginTop: 2,
                            }}
                            numberOfLines={1}
                        >
                            {getChapterNumber()}
                        </Text>
                    </View>
                </View>
                <View style={styles.historyActionsContainer}>
                    <IconButton
                        icon="delete-outline"
                        size={22}
                        color={theme.textColorPrimary}
                        onPress={() => dispatch(deleteHistoryAction(historyId))}
                    />
                    <IconButton
                        icon="play"
                        size={24}
                        color={theme.textColorPrimary}
                        onPress={navigateToChapter}
                    />
                </View>
            </View>
        </Pressable>
    );
};

export default HistoryItem;

const styles = StyleSheet.create({
    historyItemContainer: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    pressable: {
        flex: 1,
    },
    historyItemCover: {
        height: 80,
        width: 57,
        borderRadius: 4,
    },
    historyItemTitle: {
        fontSize: 16,
        flexWrap: "wrap",
    },
    historyActionsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
});

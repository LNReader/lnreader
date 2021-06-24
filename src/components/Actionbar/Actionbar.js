import React from "react";
import { StyleSheet } from "react-native";

import { IconButton } from "react-native-paper";

const actions = [
    {
        icon: "download-outline",
        onPress: () => {
            dispatch(
                downloadAllChaptersAction(
                    novel.sourceId,
                    novel.novelUrl,
                    selected
                )
            );
            setSelected([]);
        },
    },
    {
        icon: "trash-can-outline",
        onPress: () => {
            dispatch(deleteAllChaptersAction(selected));
            setSelected([]);
        },
    },
    {
        icon: "bookmark-outline",
        onPress: () => {
            dispatch(bookmarkChapterAction(selected));
            setSelected([]);
        },
    },
    {
        icon: "check",
        onPress: () => {
            dispatch(markChaptersRead(selected, novel.novelId, sort, filter));
            setSelected([]);
        },
    },
    {
        icon: "check-outline",
        onPress: () => {
            dispatch(markChapterUnreadAction(selected, novel.novelId));
            setSelected([]);
        },
    },
];

export const Actionbar = ({ actions, theme }) => {
    return (
        <View
            style={[
                styles.actionbarContainer,
                { backgroundColor: theme.colorPrimary },
            ]}
        >
            {actions.map((action) => (
                <IconButton icon={action.icon} onPress={action.onPress} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    actionbarContainer: {
        position: "absolute",
        width: Dimensions.get("window").width - 32,
        bottom: 0,
        margin: 16,
        borderRadius: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        paddingVertical: 4,
        elevation: 2,
    },
});

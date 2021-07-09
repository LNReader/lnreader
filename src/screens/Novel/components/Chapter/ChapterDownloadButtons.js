import React from "react";
import { ActivityIndicator } from "react-native";

import { IconButton } from "react-native-paper";

export const ChapterDownloadingButton = ({ theme }) => (
    <ActivityIndicator
        color={theme.textColorHint}
        size={25}
        style={{ margin: 3.5, padding: 5 }}
    />
);

export const DownloadChapterButton = ({ theme, onPress }) => (
    <IconButton
        icon="arrow-down-circle-outline"
        animated
        color={theme.textColorHint}
        size={25}
        onPress={onPress}
        style={{ margin: 2 }}
    />
);

export const DeleteChapterButton = ({ theme, onPress }) => (
    <IconButton
        icon="check-circle"
        animated
        color={theme.textColorPrimary}
        size={25}
        onPress={onPress}
        style={{ margin: 2 }}
    />
);

export const ChapterBookmarkButton = ({ theme }) => (
    <IconButton
        icon="bookmark"
        color={theme.colorAccent}
        size={18}
        style={{ marginLeft: 2 }}
    />
);

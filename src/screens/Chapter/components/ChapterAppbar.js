import React, { useState } from "react";
import { View } from "react-native";

import { Appbar } from "react-native-paper";
import { bookmarkChapterAction } from "../../../redux/novel/novel.actions";

const ChapterAppbar = ({
    navigation,
    bookmark,
    novelName,
    chapterId,
    chapterName,
    hide,
    dispatch,
    theme,
}) => {
    const [bookmarked, setBookmarked] = useState(bookmark);

    if (hide) {
        return null;
    } else {
        return (
            <View
                style={{
                    position: "absolute",
                    flex: 1,
                    backgroundColor: `${theme.colorPrimary}E6`,
                    width: "100%",
                    top: 0,
                    zIndex: 1,
                }}
            >
                <Appbar.Header
                    style={{ backgroundColor: "transparent", elevation: 0 }}
                >
                    <Appbar.BackAction
                        onPress={navigation.goBack}
                        color={theme.textColorPrimary}
                        size={26}
                        style={{ marginRight: 0 }}
                    />
                    <Appbar.Content
                        title={novelName}
                        titleStyle={{ color: theme.textColorPrimary }}
                        subtitle={chapterName}
                        subtitleStyle={{ color: theme.textColorSecondary }}
                    />
                    <Appbar.Action
                        icon={bookmarked ? "bookmark" : "bookmark-outline"}
                        size={26}
                        onPress={() => {
                            dispatch(
                                bookmarkChapterAction([{ bookmark, chapterId }])
                            );
                            setBookmarked(!bookmarked);
                        }}
                        color={theme.textColorPrimary}
                    />
                </Appbar.Header>
            </View>
        );
    }
};

export default ChapterAppbar;

import React, { useState } from "react";
import { View } from "react-native";

import { Appbar } from "react-native-paper";
import FadeView from "../../../components/Common/CrossFadeView";
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

    return (
        <FadeView
            style={{
                flex: 1,
                position: "absolute",
                width: "100%",
                top: 0,
                zIndex: 1,
            }}
            active={hide}
            animationDuration={150}
        >
            <View
                style={{ flex: 1, backgroundColor: `${theme.colorPrimary}E6` }}
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
        </FadeView>
    );
};

export default ChapterAppbar;

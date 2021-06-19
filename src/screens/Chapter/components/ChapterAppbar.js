import React, { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";

import { Appbar } from "react-native-paper";
import {
    getNextChapterFromDB,
    getPrevChapterFromDB,
} from "../../../database/queries/ChapterQueries";
import { bookmarkChapterAction } from "../../../redux/novel/novel.actions";

const ChapterAppbar = ({
    navigation,
    bookmark,
    novelName,
    chapterId,
    chapterName,
    hide,
    dispatch,
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
                    backgroundColor: "rgba(0,0,0,0.6)",
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
                        icon={bookmarked ? "bookmark" : "bookmark-outline"}
                        size={26}
                        onPress={() => {
                            dispatch(
                                bookmarkChapterAction([{ bookmark, chapterId }])
                            );
                            setBookmarked(!bookmarked);
                        }}
                        color="#FFFFFF"
                    />
                </Appbar.Header>
            </View>
        );
    }
};

export default ChapterAppbar;

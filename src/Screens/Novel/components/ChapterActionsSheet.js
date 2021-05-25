import React, { useState } from "react";
import { StyleSheet, View, Text, Animated } from "react-native";
import { List } from "react-native-paper";

import Bottomsheet from "rn-sliding-up-panel";
import BottomSheetHandle from "../../../Components/BottomSheetHandle";
import { ListItem } from "../../../Components/List";
import {
    markPreviousChaptersReadAction,
    markPreviousChaptersUnreadAction,
} from "../../../redux/novel/novel.actions";

const ChapterActionsSheet = ({
    bottomSheetRef,
    selected,
    theme,
    markChapterReadAction,
    markChapterUnreadAction,
    dispatch,
    bookmarkChapterAction,
    setSelected,
}) => {
    const [animatedValue] = useState(new Animated.Value(0));

    return (
        <Bottomsheet
            animatedValue={animatedValue}
            ref={bottomSheetRef}
            draggableRange={{ top: 270, bottom: 0 }}
            snappingPoints={[0, 270]}
        >
            <View
                style={[
                    styles.contentContainer,
                    { backgroundColor: theme.colorPrimary },
                ]}
            >
                <Text
                    style={{
                        color: theme.textColorPrimary,
                        textAlign: "center",
                        paddingTop: 16,
                        paddingBottom: 8,
                        fontSize: 16,
                    }}
                    numberOfLines={1}
                >
                    {selected?.chapterName}
                </Text>
                <List.Item
                    title="Mark previous chapters as read"
                    titleStyle={{ color: theme.textColorPrimary, fontSize: 15 }}
                    left={() => (
                        <List.Icon
                            color={theme.textColorPrimary}
                            icon="eye-check"
                            style={{ marginVertical: 0 }}
                        />
                    )}
                    onPress={() => {
                        dispatch(
                            markPreviousChaptersReadAction(
                                selected?.chapterId,
                                selected?.novelId
                            )
                        );
                        // bottomSheetRef.current.hide();
                    }}
                    rippleColor={theme.rippleColor}
                />
                <List.Item
                    title="Mark previous chapters as unread"
                    titleStyle={{ color: theme.textColorPrimary, fontSize: 15 }}
                    left={() => (
                        <List.Icon
                            color={theme.textColorPrimary}
                            icon="eye-off"
                            style={{ marginVertical: 0 }}
                        />
                    )}
                    onPress={() => {
                        dispatch(
                            markPreviousChaptersUnreadAction(
                                selected?.chapterId,
                                selected?.novelId
                            )
                        );
                        // bottomSheetRef.current.hide();
                    }}
                    rippleColor={theme.rippleColor}
                />
                <List.Item
                    title={
                        selected?.read
                            ? "Mark chapter as unread"
                            : "Mark chapter as read"
                    }
                    titleStyle={{ color: theme.textColorPrimary, fontSize: 15 }}
                    left={() => (
                        <List.Icon
                            color={theme.textColorPrimary}
                            icon={selected?.read ? "eye-off" : "eye"}
                            style={{ marginVertical: 0 }}
                        />
                    )}
                    onPress={() => {
                        if (selected?.read) {
                            dispatch(
                                markChapterUnreadAction(selected?.chapterId)
                            );
                            setSelected((selected) => ({
                                ...selected,
                                read: 0,
                            }));
                        } else {
                            dispatch(
                                markChapterReadAction(
                                    selected?.chapterId,
                                    selected?.novelId
                                )
                            );
                            setSelected((selected) => ({
                                ...selected,
                                read: 1,
                            }));
                        }
                        // bottomSheetRef.current.hide();
                    }}
                    rippleColor={theme.rippleColor}
                />
                <List.Item
                    title={
                        selected?.bookmark
                            ? "Remove bookmark"
                            : "Bookmark chapter"
                    }
                    titleStyle={{ color: theme.textColorPrimary, fontSize: 15 }}
                    left={() => (
                        <List.Icon
                            color={theme.textColorPrimary}
                            icon={
                                selected?.bookmark ? "bookmark-off" : "bookmark"
                            }
                            style={{ marginVertical: 0 }}
                        />
                    )}
                    onPress={() => {
                        dispatch(
                            bookmarkChapterAction(
                                selected?.bookmark,
                                selected?.chapterId
                            )
                        );
                        setSelected((selected) => ({
                            ...selected,
                            bookmark: !selected.bookmark,
                        }));

                        // bottomSheetRef.current.hide();
                    }}
                    rippleColor={theme.rippleColor}
                />
            </View>
        </Bottomsheet>
    );
};

export default ChapterActionsSheet;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
});

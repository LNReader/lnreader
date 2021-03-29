import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { TouchableRipple, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import {
    deleteChapterAction,
    downloadChapterAction,
} from "../../../redux/actions/novel";
import { connect } from "react-redux";

const ChapterCard = ({
    novelUrl,
    chapter,
    extensionId,
    theme,
    downloading,
    downloadChapterAction,
    deleteChapterAction,
}) => {
    const navigation = useNavigation();

    return (
        <TouchableRipple
            style={styles.chapterCardContainer}
            onPress={() =>
                navigation.navigate("ChapterItem", {
                    chapterId: chapter.chapterId,
                    chapterUrl: chapter.chapterUrl,
                    extensionId,
                    novelUrl: novelUrl,
                    chapterName: chapter.chapterName,
                    novelId: chapter.novelId,
                })
            }
            rippleColor={theme.rippleColor}
        >
            <>
                <View>
                    <Text
                        style={[
                            {
                                color: theme.textColorPrimary,
                            },
                            chapter.read === 1 && {
                                color: theme.textColorHintDark,
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
                                chapter.read === 1 && {
                                    color: theme.textColorHintDark,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {chapter.releaseDate}
                        </Text>
                    )}
                </View>
                <View>
                    {downloading === chapter.chapterId ? (
                        <ActivityIndicator
                            color={theme.textColorHintDark}
                            size={25}
                            style={{ margin: 3.5, padding: 5 }}
                        />
                    ) : (
                        <IconButton
                            icon={
                                chapter.downloaded
                                    ? "check-circle"
                                    : "arrow-down-circle-outline"
                            }
                            animated
                            color={
                                chapter.downloaded
                                    ? theme.textColorPrimary
                                    : theme.textColorHintDark
                            }
                            size={25}
                            onPress={() => {
                                if (!chapter.downloaded) {
                                    downloadChapterAction(
                                        extensionId,
                                        novelUrl,
                                        chapter.chapterUrl,
                                        chapter.chapterName,
                                        chapter.chapterId
                                    );
                                } else {
                                    deleteChapterAction(
                                        chapter.chapterId,
                                        chapter.chapterName
                                    );
                                }
                            }}
                            style={{ margin: 2 }}
                        />
                    )}
                </View>
            </>
        </TouchableRipple>
    );
};

const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
    downloading: state.novelReducer.downloading,
});

export default connect(mapStateToProps, {
    downloadChapterAction,
    deleteChapterAction,
})(ChapterCard);

const styles = StyleSheet.create({
    chapterCardContainer: {
        paddingHorizontal: 15,
        paddingVertical: 7,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});

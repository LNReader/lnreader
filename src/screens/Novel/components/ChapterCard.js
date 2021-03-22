import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { TouchableRipple, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import { useSelector } from "react-redux";
import { downloadChapter } from "../../../redux/actions/novel";
import { connect } from "react-redux";

const ChapterCard = ({
    novelUrl,
    chapter,
    extensionId,
    theme,
    downloading,
    downloadChapter,
}) => {
    const navigation = useNavigation();

    const isDownloading = () =>
        downloading.some(
            (obj) =>
                obj.chapterUrl === chapter.chapterUrl &&
                obj.novelUrl === novelUrl
        );

    return (
        <TouchableRipple
            style={styles.chapterCardContainer}
            onPress={() =>
                navigation.navigate("ChapterItem", {
                    chapterUrl: chapter.chapterUrl,
                    extensionId,
                    novelUrl: novelUrl,
                    chapterName: chapter.chapterName,
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
                    {isDownloading() && !chapter.downloaded ? (
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
                                downloadChapter(
                                    extensionId,
                                    novelUrl,
                                    chapter.chapterUrl,
                                    chapter.chapterName
                                );
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

export default connect(mapStateToProps, { downloadChapter })(ChapterCard);

const styles = StyleSheet.create({
    chapterCardContainer: {
        paddingHorizontal: 15,
        paddingVertical: 7,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});

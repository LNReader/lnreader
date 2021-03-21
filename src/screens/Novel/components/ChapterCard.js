import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { TouchableRipple, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import { useSelector } from "react-redux";

const ChapterCard = ({
    novelUrl,
    chapter,
    downloadChapter,
    extensionId,
    downloading,
}) => {
    const [downloaded, setDownloaded] = useState(chapter.downloaded);

    const theme = useSelector((state) => state.themeReducer.theme);

    const navigation = useNavigation();

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
                    {downloading.downloading &&
                    downloading.chapterUrl === chapter.chapterUrl ? (
                        <ActivityIndicator
                            color={theme.textColorHintDark}
                            size={25}
                            style={{ margin: 3.5, padding: 5 }}
                        />
                    ) : (
                        <IconButton
                            icon={
                                downloaded
                                    ? "check-circle"
                                    : "arrow-down-circle-outline"
                            }
                            animated
                            color={
                                downloaded
                                    ? theme.textColorPrimary
                                    : theme.textColorHintDark
                            }
                            size={25}
                            onPress={() => {
                                downloadChapter(
                                    downloaded ? 1 : 0,
                                    extensionId,
                                    novelUrl,
                                    chapter.chapterUrl,
                                    chapter.chapterName
                                );
                                setDownloaded(!downloaded);
                            }}
                            style={{ margin: 2 }}
                        />
                    )}
                </View>
            </>
        </TouchableRipple>
    );
};

export default ChapterCard;

const styles = StyleSheet.create({
    chapterCardContainer: {
        paddingHorizontal: 15,
        paddingVertical: 7,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});

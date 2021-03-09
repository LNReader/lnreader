import React, { useState } from "react";

import { View, Text, ActivityIndicator } from "react-native";
import { TouchableRipple, IconButton } from "react-native-paper";

import { useSelector } from "react-redux";

const ChapterCard = ({
    navigation,
    novelUrl,
    chapter,
    downloadChapter,
    extensionId,
    downloading,
}) => {
    const [downloaded, setDownloaded] = useState(chapter.downloaded);

    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <TouchableRipple
            style={{
                paddingHorizontal: 15,
                paddingVertical: 7,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                // borderTopColor: "rgba(255,255,255,.12)",
                // borderTopWidth: 1,
            }}
            onPress={() =>
                navigation.navigate("ChapterItem", {
                    chapterUrl: chapter.chapterUrl,
                    extensionId,
                    novelUrl: novelUrl,
                    chapterName: chapter.chapterName,
                })
            }
            rippleColor={theme.rippleColorDark}
        >
            <>
                <View>
                    <Text
                        style={[
                            {
                                color: theme.textColorPrimaryDark,
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
                                    color: theme.textColorSecondaryDark,
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
                                    ? theme.textColorPrimaryDark
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

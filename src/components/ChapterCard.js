import React from "react";
import { View, Text } from "react-native";
import { TouchableRipple, IconButton } from "react-native-paper";
import { theme } from "../theming/theme";

const ChapterCard = ({
    navigation,
    novelUrl,
    chapter,
    downloadChapter,
    extensionId,
}) => (
    <TouchableRipple
        style={{
            paddingHorizontal: 15,
            paddingVertical: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
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
                    {chapter.chapterName.substring(0, 50) + "..."}
                </Text>
                <Text
                    style={[
                        {
                            color: theme.textColorSecondaryDark,
                            marginTop: 5,
                            fontSize: 13,
                        },
                        chapter.read === 1 && {
                            color: theme.textColorHintDark,
                        },
                    ]}
                    numberOfLines={1}
                >
                    {chapter.releaseDate ? chapter.releaseDate : "release-date"}
                </Text>
            </View>
            <View>
                <IconButton
                    icon={
                        chapter.downloaded
                            ? "check-circle"
                            : "arrow-down-circle-outline"
                    }
                    animated
                    color={
                        chapter.downloaded
                            ? "#47a84a"
                            : theme.textColorSecondaryDark
                    }
                    size={24}
                    onPress={() => {
                        downloadChapter(
                            chapter.downloaded ? chapter.downloaded : 0,
                            chapter.chapterUrl
                        );
                    }}
                />
            </View>
        </>
    </TouchableRipple>
);

export default ChapterCard;

import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { TouchableRipple, IconButton, Menu } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import {
    deleteChapterAction,
    downloadChapterAction,
} from "../../../redux/novel/novel.actions";
import { connect } from "react-redux";

const ChapterCard = ({
    novelUrl,
    chapter,
    extensionId,
    theme,
    // downloading,
    downloadChapterAction,
    deleteChapterAction,
}) => {
    const navigation = useNavigation();

    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const displayDownloadButton = () => {
        if (chapter.downloaded === 3) {
            return (
                <ActivityIndicator
                    color={theme.textColorHintDark}
                    size={25}
                    style={{ margin: 3.5, padding: 5 }}
                />
            );
        } else if (chapter.downloaded === 1) {
            return (
                <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={
                        <IconButton
                            icon="check-circle"
                            animated
                            color={theme.textColorPrimary}
                            size={25}
                            onPress={openMenu}
                            style={{ margin: 2 }}
                        />
                    }
                    contentStyle={{ backgroundColor: theme.menuColor }}
                >
                    <Menu.Item
                        onPress={() =>
                            deleteChapterAction(
                                chapter.chapterId,
                                chapter.chapterName
                            )
                        }
                        title="Delete"
                        titleStyle={{ color: theme.textColorPrimary }}
                    />
                </Menu>
            );
        } else {
            return (
                <IconButton
                    icon="arrow-down-circle-outline"
                    animated
                    color={theme.textColorHintDark}
                    size={25}
                    onPress={() => {
                        downloadChapterAction(
                            extensionId,
                            novelUrl,
                            chapter.chapterUrl,
                            chapter.chapterName,
                            chapter.chapterId
                        );
                        // console.log(downloading);
                    }}
                    style={{ margin: 2 }}
                />
            );
        }
    };

    return (
        <TouchableRipple
            style={styles.chapterCardContainer}
            onPress={() =>
                navigation.navigate("Chapter", {
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
                <View>{displayDownloadButton()}</View>
            </>
        </TouchableRipple>
    );
};

const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
    // downloading: state.novelReducer.downloading,
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

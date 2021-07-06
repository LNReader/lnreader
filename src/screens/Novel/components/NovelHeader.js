import React from "react";
import { View, Text, StyleSheet, Clipboard, Pressable } from "react-native";

import * as WebBrowser from "expo-web-browser";
import { TouchableRipple, IconButton } from "react-native-paper";

import { followNovelAction } from "../../../redux/novel/novel.actions";
import { useTrackingStatus } from "../../../hooks/reduxHooks";

import {
    CoverImage,
    NovelAuthor,
    NovelInfo,
    NovelInfoContainer,
    NovelThumbnail,
    NovelTitle,
    FollowButton,
    TrackerButton,
    NovelGenres,
} from "./Info/NovelDetailsComponents";
import { Row } from "../../../components/Common";
import NovelSummary from "./Info/NovelSummary";
import ReadButton from "./Info/ReadButton";
import { showToast } from "../../../hooks/showToast";

const NovelInfoHeader = ({
    item,
    novel,
    theme,
    filter,
    loading,
    dispatch,
    chapters,
    lastRead,
    navigation,
    trackerSheetRef,
    chaptersSettingsSheetRef,
}) => {
    const { tracker, trackedNovels } = useTrackingStatus();

    let isTracked = false;

    if (!loading) {
        isTracked = trackedNovels.find((obj) => obj.novelId === novel.novelId);
    }

    return (
        <View>
            <CoverImage source={{ uri: item.novelCover }} theme={theme}>
                <NovelInfoContainer>
                    <NovelThumbnail source={{ uri: item.novelCover }} />
                    <View style={styles.novelDetails}>
                        <NovelTitle
                            theme={theme}
                            onPress={() =>
                                navigation.navigate("GlobalSearch", {
                                    novelName: item.novelName,
                                })
                            }
                            onLongPress={() => {
                                Clipboard.setString(item.novelName);
                                showToast(
                                    "Copied to clipboard: " + item.novelName
                                );
                            }}
                        >
                            {item.novelName}
                        </NovelTitle>
                        {!loading && (
                            <>
                                <NovelAuthor theme={theme}>
                                    {novel.author}
                                </NovelAuthor>
                                <NovelInfo theme={theme}>
                                    {novel.status}
                                </NovelInfo>
                                <NovelInfo theme={theme}>
                                    {novel.source}
                                </NovelInfo>
                            </>
                        )}
                    </View>
                </NovelInfoContainer>
            </CoverImage>
            {!loading && (
                <>
                    <Row
                        style={{
                            justifyContent: "space-around",
                            paddingHorizontal: 16,
                            flex: 1,
                        }}
                    >
                        <FollowButton
                            theme={theme}
                            followed={novel.followed}
                            onPress={() => dispatch(followNovelAction(novel))}
                        />
                        {tracker && (
                            <TrackerButton
                                theme={theme}
                                isTracked={isTracked}
                                onPress={() => trackerSheetRef.current.show()}
                            />
                        )}
                        <View
                            style={{
                                borderRadius: 4,
                                overflow: "hidden",
                                flex: 1,
                            }}
                        >
                            <Pressable
                                android_ripple={{
                                    color: theme.rippleColor,
                                    borderless: false,
                                }}
                                onPress={() =>
                                    navigation.navigate("MigrateNovel", {
                                        sourceId: novel.sourceId,
                                        novelName: novel.novelName,
                                    })
                                }
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    paddingBottom: 8,
                                }}
                            >
                                <IconButton
                                    icon="swap-vertical-variant"
                                    color={theme.textColorHint}
                                    size={24}
                                    style={{ margin: 0 }}
                                />
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: theme.textColorHint,
                                    }}
                                >
                                    Migrate
                                </Text>
                            </Pressable>
                        </View>
                        <View
                            style={{
                                borderRadius: 4,
                                overflow: "hidden",
                                flex: 1,
                            }}
                        >
                            <Pressable
                                android_ripple={{
                                    color: theme.rippleColor,
                                    borderless: false,
                                }}
                                onPress={() =>
                                    WebBrowser.openBrowserAsync(novel.sourceUrl)
                                }
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    paddingBottom: 8,
                                }}
                            >
                                <IconButton
                                    icon="earth"
                                    color={theme.textColorHint}
                                    size={24}
                                    style={{ margin: 0 }}
                                />
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: theme.textColorHint,
                                    }}
                                >
                                    WebView
                                </Text>
                            </Pressable>
                        </View>
                    </Row>
                    <NovelSummary
                        summary={novel.novelSummary}
                        followed={novel.followed}
                        theme={theme}
                    />
                    {novel.genre && novel.genre !== "" && (
                        <NovelGenres theme={theme} genre={novel.genre} />
                    )}
                    <ReadButton
                        novel={novel}
                        chapters={chapters}
                        navigation={navigation}
                        theme={theme}
                        lastRead={lastRead}
                    />
                    <TouchableRipple
                        style={styles.bottomsheet}
                        onPress={() => chaptersSettingsSheetRef.current.show()}
                        rippleColor={theme.rippleColor}
                    >
                        <>
                            <Text
                                style={[
                                    { color: theme.textColorPrimary },
                                    styles.chapters,
                                ]}
                            >
                                {`${chapters.length} Chapters`}
                            </Text>
                            <IconButton
                                icon="filter-variant"
                                color={
                                    filter
                                        ? theme.filterColor
                                        : theme.textColorPrimary
                                }
                                size={24}
                            />
                        </>
                    </TouchableRipple>
                </>
            )}
        </View>
    );
};

export default NovelInfoHeader;

const styles = StyleSheet.create({
    novelDetails: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    chapters: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        fontSize: 16,
        fontWeight: "bold",
    },
    bottomsheet: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 12,
    },
});

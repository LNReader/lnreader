import React, { memo } from "react";
import { View, Text, StyleSheet, Clipboard, Pressable } from "react-native";

import * as WebBrowser from "expo-web-browser";
import { IconButton } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { followNovelAction } from "../../../../redux/novel/novel.actions";
import { useTrackingStatus } from "../../../../hooks/reduxHooks";

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
} from "./NovelInfoComponents";
import { Row } from "../../../../components/Common";
import NovelSummary from "./NovelSummary";
import ReadButton from "./ReadButton";
import { showToast } from "../../../../hooks/showToast";

// const getStatusIcon = (status) => {
//     const icons = {
//         Ongoing: "clock-outline",
//         Completed: "check-all",
//         Unknown: "help",
//     };

//     return icons[status] || icons.Unknown;
// };

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
    setCustomNovelCover,
    chaptersSettingsSheetRef,
}) => {
    const { tracker, trackedNovels } = useTrackingStatus();

    let isTracked = false;

    if (!loading) {
        isTracked = trackedNovels.find((obj) => obj.novelId === novel.novelId);
    }

    const getNovelCoverUrl = () => {
        const defaultCover =
            "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true";

        if (loading) {
            if (item.novelCover && !item.novelCover.startsWith("/")) {
                return item.novelCover;
            } else {
                return defaultCover;
            }
        } else {
            if (novel.novelCover && !novel.novelCover.startsWith("/")) {
                return novel.novelCover;
            } else {
                return defaultCover;
            }
        }
    };

    return (
        <View>
            <CoverImage
                source={{
                    uri: getNovelCoverUrl(),
                }}
                theme={theme}
            >
                <NovelInfoContainer>
                    <NovelThumbnail
                        source={{ uri: getNovelCoverUrl() }}
                        theme={theme}
                        setCustomNovelCover={setCustomNovelCover}
                    />
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
                        <>
                            <NovelAuthor theme={theme}>
                                {!loading && novel.author
                                    ? novel.author
                                    : "Unknown author"}
                            </NovelAuthor>
                            <Row>
                                {/* <MaterialCommunityIcons
                                    name={
                                        loading
                                            ? "help"
                                            : getStatusIcon(novel.status)
                                    }
                                    size={16}
                                    color={theme.textColorSecondary}
                                    style={{ marginRight: 4 }}
                                /> */}
                                <NovelInfo theme={theme}>
                                    {!loading
                                        ? (novel.status || "Unknown status") +
                                          " • " +
                                          novel.source
                                        : "Unknown status • Unknown source"}
                                </NovelInfo>
                            </Row>
                        </>
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
                            marginTop: 12,
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
                    {novel.genre !== null && novel.genre !== "" && (
                        <NovelGenres theme={theme} genre={novel.genre} />
                    )}
                    <ReadButton
                        novel={novel}
                        chapters={chapters}
                        navigation={navigation}
                        theme={theme}
                        lastRead={lastRead}
                    />
                    <Pressable
                        style={styles.bottomsheet}
                        onPress={() => chaptersSettingsSheetRef.current.show()}
                        android_ripple={{ color: theme.rippleColor }}
                    >
                        <>
                            <Text
                                style={[
                                    { color: theme.textColorPrimary },
                                    styles.chapters,
                                ]}
                            >
                                {`${chapters.length} chapters`}
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
                    </Pressable>
                </>
            )}
        </View>
    );
};

export default memo(NovelInfoHeader);

const styles = StyleSheet.create({
    novelDetails: {
        flex: 1,
        paddingBottom: 16,
        paddingLeft: 12,
        justifyContent: "center",
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

import React, { useState } from "react";
import { View, Text, StyleSheet, Share } from "react-native";

import * as WebBrowser from "expo-web-browser";
import { TouchableRipple, IconButton, Menu } from "react-native-paper";

import {
    downloadAllChaptersAction,
    deleteAllChaptersAction,
    followNovelAction,
} from "../../../redux/novel/novel.actions";
import { useTrackingStatus } from "../../../Hooks/reduxHooks";

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
import { Row } from "../../../Components/Common";
import NovelSummary from "./Info/NovelSummary";
import ReadButton from "./Info/ReadButton";

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
    const [downloadMenu, showDownloadMenu] = useState(false);

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
                        <NovelTitle theme={theme}>{item.novelName}</NovelTitle>
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
                    <Row>
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
                        <IconButton
                            onPress={() =>
                                WebBrowser.openBrowserAsync(novel.sourceUrl)
                            }
                            icon="earth"
                            color={theme.colorAccent}
                            size={21}
                        />
                        <IconButton
                            onPress={() =>
                                Share.share({ message: novel.sourceUrl })
                            }
                            icon="share-variant"
                            color={theme.colorAccent}
                            size={21}
                        />
                        <Menu
                            visible={downloadMenu}
                            onDismiss={() => showDownloadMenu(false)}
                            anchor={
                                <IconButton
                                    icon="download"
                                    color={theme.colorAccent}
                                    size={21}
                                    onPress={() => showDownloadMenu(true)}
                                />
                            }
                            contentStyle={{ backgroundColor: theme.menuColor }}
                        >
                            <Menu.Item
                                title="Download all"
                                style={{ backgroundColor: theme.menuColor }}
                                titleStyle={{ color: theme.textColorPrimary }}
                                onPress={() =>
                                    dispatch(
                                        downloadAllChaptersAction(
                                            novel.sourceId,
                                            novel.novelUrl,
                                            chapters
                                        )
                                    )
                                }
                            />
                            <Menu.Item
                                title="Delete downloads"
                                style={{ backgroundColor: theme.menuColor }}
                                titleStyle={{ color: theme.textColorPrimary }}
                                onPress={() =>
                                    dispatch(deleteAllChaptersAction(chapters))
                                }
                            />
                        </Menu>
                    </Row>
                    <NovelSummary
                        summary={novel.novelSummary}
                        followed={novel.followed}
                        theme={theme}
                    />
                    <NovelGenres theme={theme} genre={novel.genre} />
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

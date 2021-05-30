import React from "react";
import { View, Text, StyleSheet } from "react-native";

import * as WebBrowser from "expo-web-browser";
import { TouchableRipple, IconButton } from "react-native-paper";

import { followNovelAction } from "../../../redux/novel/novel.actions";
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
                    <Row
                        style={{
                            justifyContent: "space-around",
                            paddingHorizontal: 16,
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
                        <View style={{ alignItems: "center" }}>
                            <IconButton
                                icon="swap-vertical-variant"
                                color={theme.textColorSecondary}
                                size={24}
                                style={{ margin: 0 }}
                                onPress={() =>
                                    navigation.navigate("MigrateNovel", {
                                        sourceId: novel.sourceId,
                                        novelName: novel.novelName,
                                    })
                                }
                            />
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: theme.textColorSecondary,
                                }}
                            >
                                Migrate
                            </Text>
                        </View>
                        <View style={{ alignItems: "center" }}>
                            <IconButton
                                icon="earth"
                                color={theme.textColorSecondary}
                                size={24}
                                style={{ margin: 0 }}
                                onPress={() =>
                                    WebBrowser.openBrowserAsync(novel.sourceUrl)
                                }
                            />
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: theme.textColorSecondary,
                                }}
                            >
                                WebView
                            </Text>
                        </View>
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

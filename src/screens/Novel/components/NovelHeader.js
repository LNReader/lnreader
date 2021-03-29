import React, { useState } from "react";
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    Image,
    FlatList,
    Share,
} from "react-native";
import { TouchableRipple, IconButton, Button, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const NovelInfoHeader = ({
    item,
    novel,
    noOfChapters,
    followNovelAction,
    loading,
    bottomSheetRef,
    theme,
}) => {
    const navigation = useNavigation();

    const [more, setMore] = useState(
        !loading && novel.followed !== 1 ? true : false
    );

    const renderGenreChip = ({ item }) => (
        <Text
            style={[
                styles.genre,
                {
                    color: theme.colorAccentDark,
                    borderColor: theme.colorAccentDark,
                    backgroundColor: theme.colorPrimary,
                },
            ]}
        >
            {item}
        </Text>
    );

    return (
        <View style={{ flexGrow: 1 }}>
            <ImageBackground
                source={{ uri: item.novelCover }}
                style={styles.background}
            >
                <LinearGradient
                    colors={["rgba(0,0,0,0.2)", theme.colorPrimaryDark]}
                    style={styles.linearGradient}
                >
                    <View style={styles.detailsContainer}>
                        <View>
                            <Image
                                source={{ uri: item.novelCover }}
                                style={styles.logo}
                            />
                        </View>
                        <View style={styles.nameContainer}>
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.name,
                                    { color: theme.textColorPrimary },
                                ]}
                            >
                                {item.novelName}
                            </Text>
                            {!loading && (
                                <>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondary,
                                            marginVertical: 3,
                                            fontSize: 14,
                                            fontWeight: "bold",
                                        }}
                                        numberOfLines={2}
                                    >
                                        {novel.author.replace(",", ", ")}
                                    </Text>

                                    <Text
                                        style={{
                                            color: theme.textColorSecondary,
                                            marginVertical: 3,
                                            fontSize: 14,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {novel.status}
                                    </Text>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondary,
                                            fontSize: 14,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {novel.source}
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
            {!loading && (
                <>
                    <View style={styles.buttonsContainer}>
                        <Chip
                            mode="outlined"
                            icon={() => (
                                <MaterialCommunityIcons
                                    name={
                                        novel.followed
                                            ? "heart"
                                            : "heart-outline"
                                    }
                                    size={21}
                                    color={theme.colorAccentDark}
                                />
                            )}
                            onPress={() =>
                                followNovelAction(novel.followed, novel.novelId)
                            }
                            style={[
                                { backgroundColor: theme.colorPrimaryDark },
                                styles.toggleFavourite,
                            ]}
                            textStyle={{
                                fontWeight: "bold",
                                color: theme.textColorPrimary,
                            }}
                        >
                            {novel.followed ? "In Library" : "Add to library"}
                        </Chip>

                        <IconButton
                            onPress={() =>
                                WebBrowser.openBrowserAsync(
                                    novel.source_url && novel.source_url
                                )
                            }
                            icon="earth"
                            color={theme.colorAccentDark}
                            size={21}
                        />
                        <IconButton
                            onPress={() =>
                                Share.share({
                                    message: novel.source_url,
                                })
                            }
                            icon="share-variant"
                            color={theme.colorAccentDark}
                            size={21}
                        />
                    </View>

                    {novel.novelSummary !== "" && (
                        <View
                            style={{
                                paddingHorizontal: 16,
                                marginBottom: 8,
                            }}
                        >
                            <Text
                                style={[
                                    { color: theme.textColorPrimary },
                                    styles.summaryHeader,
                                ]}
                            >
                                About
                            </Text>
                            <Text
                                style={{
                                    color: theme.textColorSecondary,
                                    lineHeight: 20,
                                }}
                                numberOfLines={more ? 100 : 2}
                                onPress={() => setMore(!more)}
                                ellipsizeMode="clip"
                            >
                                {novel.novelSummary}
                            </Text>
                            <Text
                                style={[
                                    {
                                        color: theme.colorAccentDark,
                                        backgroundColor: theme.colorPrimaryDark,
                                    },
                                    styles.moreBtn,
                                ]}
                                onPress={() => setMore(!more)}
                            >
                                {more ? "Less " : "More "}
                            </Text>
                        </View>
                    )}

                    <FlatList
                        style={
                            novel.novelSummary === ""
                                ? { marginTop: 20 }
                                : { marginTop: 12 }
                        }
                        contentContainerStyle={styles.genreContainer}
                        horizontal
                        data={novel.genre && novel.genre.split(",")}
                        keyExtractor={(item) => item}
                        renderItem={renderGenreChip}
                        showsHorizontalScrollIndicator={false}
                    />

                    <Button
                        color="white"
                        style={[
                            { backgroundColor: theme.colorAccentDark },
                            styles.startButton,
                        ]}
                        uppercase={false}
                        labelStyle={{ letterSpacing: 0 }}
                        // onPress={() =>
                        //     navigation.navigate("ChapterItem", {
                        //         chapterUrl: novel.lastRead,
                        //         novelUrl: novel.novelUrl,
                        //         extensionId: novel.extensionId,
                        //         chapterName: novel.lastReadName,
                        //     })
                        // }
                    >
                        {novel.unread === 1
                            ? `Start reading ${novel.lastReadName}`
                            : `Continue reading ${novel.lastReadName}`}
                    </Button>

                    <TouchableRipple
                        style={styles.bottomsheet}
                        onPress={() =>
                            bottomSheetRef.current.show({ velocity: -1.5 })
                        }
                        rippleColor={theme.rippleColor}
                    >
                        <>
                            <Text
                                style={[
                                    { color: theme.textColorPrimary },
                                    styles.chapters,
                                ]}
                            >
                                {noOfChapters + " Chapters"}
                            </Text>
                            <IconButton
                                icon="filter-variant"
                                color={theme.textColorPrimary}
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
    nameContainer: {
        flex: 1,
        marginHorizontal: 16,
        paddingTop: 8,
    },
    background: {
        height: 285,
    },
    linearGradient: {
        height: 286,
    },
    detailsContainer: {
        flex: 1,
        flexDirection: "row",
        margin: 16,
        paddingTop: 90,
    },
    logo: {
        height: 160,
        width: 110,
        margin: 3.2,
        borderRadius: 6,
    },
    genre: {
        borderRadius: 50,
        borderWidth: 1,
        paddingHorizontal: 10,
        marginHorizontal: 2,
        fontSize: 13,
        paddingVertical: 2,
        justifyContent: "center",
        flex: 1,
    },
    name: {
        fontWeight: "bold",
        fontSize: 18,
    },
    buttonsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    toggleFavourite: {
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 16,
        marginRight: 4,
        paddingHorizontal: 4,
        borderWidth: 0,
        elevation: 0,
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
    summaryHeader: {
        marginTop: 5,
        paddingVertical: 5,
        fontSize: 15,
        fontWeight: "bold",
    },
    moreBtn: {
        fontWeight: "bold",
        position: "absolute",
        bottom: 0,
        right: 16,
        paddingLeft: 6,
    },
    startButton: {
        marginTop: 8,
        marginBottom: 16,
        marginHorizontal: 16,
    },
    genreContainer: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
});

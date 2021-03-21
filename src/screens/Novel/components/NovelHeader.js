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
    insertNovelInLibrary,
    loading,
    bottomSheetRef,
    theme,
}) => {
    const navigation = useNavigation();

    const [more, setMore] = useState(
        !loading && novel.libraryStatus !== 1 ? true : false
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
                source={{
                    uri: item.novelCover,
                }}
                style={styles.background}
            >
                <LinearGradient
                    colors={["rgba(0,0,0,0.2)", theme.colorPrimaryDark]}
                    style={styles.linearGradient}
                >
                    <View style={styles.detailsContainer}>
                        <View>
                            <Image
                                source={{
                                    uri: item.novelCover,
                                }}
                                style={styles.logo}
                            />
                        </View>
                        <View style={styles.nameContainer}>
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.name,
                                    {
                                        color: theme.textColorPrimary,
                                    },
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
                                    >
                                        {novel["Author(s)"] &&
                                            novel["Author(s)"].replace(
                                                ",",
                                                ", "
                                            )}
                                    </Text>

                                    <Text
                                        style={{
                                            color: theme.textColorSecondary,
                                            marginVertical: 3,
                                            fontSize: 14,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {novel["Status"]}
                                    </Text>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondary,
                                            // marginVertical: 3,
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
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <Chip
                            mode="outlined"
                            icon={() => (
                                <MaterialCommunityIcons
                                    name={
                                        novel.libraryStatus
                                            ? "heart"
                                            : "heart-outline"
                                    }
                                    size={21}
                                    color={theme.colorAccentDark}
                                />
                            )}
                            onPress={() =>
                                insertNovelInLibrary(
                                    novel.libraryStatus,
                                    novel.novelUrl
                                )
                            }
                            style={[
                                {
                                    backgroundColor: theme.colorPrimaryDark,
                                    marginRight: 2,
                                    // borderColor: "rgba(255,255,255,0.121)",
                                    borderWidth: 0,
                                    justifyContent: "center",
                                    height: 30,
                                    alignItems: "center",
                                    marginLeft: 15,
                                    paddingHorizontal: 3,
                                    shadowOpacity: 0,
                                    shadowOffset: 0,
                                },
                                // libraryStatus && {
                                //     backgroundColor: "rgba(41,121,255,0.38)",
                                // },
                            ]}
                            textStyle={{
                                fontWeight: "bold",
                                color: theme.textColorPrimary,
                            }}
                        >
                            {novel.libraryStatus
                                ? "In Library"
                                : "Add to library"}
                        </Chip>

                        <IconButton
                            onPress={() =>
                                WebBrowser.openBrowserAsync(
                                    novel.sourceUrl && novel.sourceUrl
                                )
                            }
                            icon="earth"
                            color={theme.colorAccentDark}
                            size={21}
                        />
                        <IconButton
                            onPress={() =>
                                Share.share({
                                    message: novel.sourceUrl,
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
                                paddingHorizontal: 15,
                                marginBottom: 10,
                                // marginTop: 5,
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.textColorPrimary,
                                    marginTop: 5,
                                    paddingVertical: 5,
                                    fontSize: 15,
                                    fontWeight: "bold",
                                }}
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
                                style={{
                                    color: theme.colorAccentDark,
                                    fontWeight: "bold",
                                    position: "absolute",
                                    bottom: 0,
                                    right: 15,
                                    backgroundColor: theme.colorPrimaryDark,
                                    paddingLeft: 5,
                                }}
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
                                : { marginTop: 10 }
                        }
                        contentContainerStyle={{
                            paddingHorizontal: 15,
                            paddingBottom: 15,
                        }}
                        horizontal
                        data={novel["Genre(s)"] && novel["Genre(s)"].split(",")}
                        keyExtractor={(item) => item}
                        renderItem={renderGenreChip}
                        showsHorizontalScrollIndicator={false}
                    />

                    <Button
                        color="white"
                        style={{
                            backgroundColor: theme.colorAccentDark,
                            marginHorizontal: 15,
                            marginTop: 8,
                            marginBottom: 15,
                        }}
                        uppercase={false}
                        labelStyle={{ letterSpacing: 0 }}
                        onPress={() =>
                            navigation.navigate("ChapterItem", {
                                chapterUrl: novel.lastRead,
                                novelUrl: novel.novelUrl,
                                extensionId: novel.extensionId,
                                chapterName: novel.lastReadName,
                            })
                        }
                    >
                        {novel.unread && novel.unread === 1
                            ? `Start reading ${novel.lastReadName}`
                            : `Continue reading ${novel.lastReadName}`}
                    </Button>

                    <TouchableRipple
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingRight: 12.5,
                        }}
                        onPress={() =>
                            bottomSheetRef.current.show({ velocity: -1.5 })
                        }
                        rippleColor={theme.rippleColor}
                    >
                        <>
                            <Text
                                style={{
                                    color: theme.textColorPrimary,
                                    paddingHorizontal: 15,
                                    paddingVertical: 5,
                                    fontSize: 16,
                                    fontWeight: "bold",
                                }}
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
        marginHorizontal: 15,
        paddingTop: 10,
    },
    background: {
        height: 285,
        // backgroundColor: theme.colorPrimaryDark,
    },
    linearGradient: {
        // flex: 1,
        height: 286,
    },
    detailsContainer: {
        flex: 1,
        flexDirection: "row",
        margin: 15,
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
});

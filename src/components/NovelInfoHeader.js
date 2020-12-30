import React, { useState } from "react";
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    Image,
    FlatList,
} from "react-native";
import { TouchableRipple, IconButton, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "../theming/theme";

const NovelInfoHeader = ({
    item,
    novel,
    loading,
    libraryStatus,
    noOfChapters,
    insertToLibrary,
    sortChapters,
}) => {
    const [more, setMore] = useState(false);

    const renderGenreChip = ({ item }) => (
        <Text
            style={[
                styles.genre,
                {
                    color: theme.colorAccentDark,
                    borderColor: theme.colorAccentDark,
                },
            ]}
        >
            {item}
        </Text>
    );

    return (
        <>
            <ImageBackground
                source={{
                    uri: item.novelCover,
                }}
                style={styles.background}
            >
                <LinearGradient
                    colors={["transparent", "#000000"]}
                    style={styles.linearGradient}
                >
                    <View style={styles.detailsContainer}>
                        <Image
                            source={{
                                uri: item.novelCover,
                            }}
                            style={styles.logo}
                        />
                        <View style={styles.nameContainer}>
                            <Text
                                numberOfLines={4}
                                style={[
                                    styles.name,
                                    {
                                        color: theme.textColorPrimaryDark,
                                    },
                                ]}
                            >
                                {item.novelName}
                            </Text>
                            {!loading ? (
                                <>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondaryDark,
                                            marginVertical: 3,
                                            fontSize: 15,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {novel.Alternative &&
                                            novel.Alternative.replace(
                                                ",",
                                                ", "
                                            )}
                                    </Text>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondaryDark,
                                            marginVertical: 3,
                                            fontSize: 15,
                                        }}
                                    >
                                        {novel["Author(s)"].replace(",", ", ")}
                                    </Text>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondaryDark,
                                            marginVertical: 3,
                                            fontSize: 15,
                                        }}
                                    >
                                        {novel["Release"]}
                                    </Text>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondaryDark,
                                            marginVertical: 3,
                                            fontSize: 15,
                                        }}
                                    >
                                        {novel["Status"] +
                                            " • " +
                                            novel["Type"]}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondaryDark,
                                            marginVertical: 3,
                                            fontSize: 15,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {item.Alternative &&
                                            item.Alternative.replace(",", ", ")}
                                    </Text>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondaryDark,
                                            marginVertical: 3,
                                            fontSize: 15,
                                        }}
                                    >
                                        {item["Author(s)"] &&
                                            item["Author(s)"].replace(
                                                ",",
                                                ", "
                                            )}
                                    </Text>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondaryDark,
                                            marginVertical: 3,
                                            fontSize: 15,
                                        }}
                                    >
                                        {item["Release"] && item["Release"]}
                                    </Text>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondaryDark,
                                            marginVertical: 3,
                                            fontSize: 15,
                                        }}
                                    >
                                        {item["Status"] &&
                                            item["Type"] &&
                                            item["Status"] +
                                                " • " +
                                                item["Type"]}
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>

            {!loading ? (
                <>
                    <Button
                        color={theme.textColorPrimaryDark}
                        style={[
                            {
                                backgroundColor: theme.colorAccentDark,
                                marginHorizontal: 15,
                            },
                            novel.novelSummary === "" && {
                                marginBottom: 20,
                            },
                        ]}
                        icon={
                            libraryStatus === 0
                                ? "bookmark-outline"
                                : "bookmark"
                        }
                        uppercase={false}
                        labelStyle={{ letterSpacing: 0 }}
                        onPress={() => insertToLibrary()}
                    >
                        {libraryStatus === 0 ? "Add to library" : "In Library"}
                    </Button>
                    {novel.novelSummary !== "" && (
                        <View
                            style={{
                                paddingHorizontal: 15,
                                marginBottom: 10,
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.textColorPrimaryDark,
                                    marginTop: 5,
                                    paddingVertical: 5,
                                    fontSize: 15,
                                }}
                            >
                                About
                            </Text>
                            <Text
                                style={{
                                    color: theme.textColorSecondaryDark,
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
                                    backgroundColor: "black",
                                    paddingLeft: 5,
                                }}
                                onPress={() => setMore(!more)}
                            >
                                {more ? "Less" : "More"}
                            </Text>
                        </View>
                    )}
                    <FlatList
                        contentContainerStyle={{
                            paddingHorizontal: 15,
                            marginBottom: 15,
                        }}
                        horizontal
                        data={novel["Genre(s)"].split(",")}
                        keyExtractor={(item) => item}
                        renderItem={renderGenreChip}
                    />
                    <TouchableRipple
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingRight: 15,
                        }}
                        onPress={() => sortChapters()}
                        rippleColor={theme.rippleColorDark}
                    >
                        <>
                            <Text
                                style={{
                                    color: theme.textColorPrimaryDark,
                                    paddingHorizontal: 15,
                                    paddingVertical: 5,
                                    fontSize: 15,
                                }}
                            >
                                {noOfChapters + "  Chapters"}
                            </Text>
                            <IconButton
                                icon="filter-variant"
                                color={theme.textColorPrimaryDark}
                                size={24}
                                onPress={() => sortChapters()}
                            />
                        </>
                    </TouchableRipple>
                </>
            ) : (
                <>
                    {item.libraryStatus && (
                        <Button
                            color={theme.textColorPrimaryDark}
                            style={[
                                {
                                    backgroundColor: theme.colorAccentDark,
                                    marginHorizontal: 15,
                                },
                                item.novelSummary === "" && {
                                    marginBottom: 20,
                                },
                            ]}
                            icon={
                                item.libraryStatus === 0
                                    ? "bookmark-outline"
                                    : "bookmark"
                            }
                            uppercase={false}
                            labelStyle={{ letterSpacing: 0 }}
                            onPress={() => insertToLibrary()}
                        >
                            {item.libraryStatus === 0
                                ? "Add to library"
                                : "In Library"}
                        </Button>
                    )}
                    {item.novelSummary !== "" && (
                        <View
                            style={{
                                paddingHorizontal: 15,
                                marginBottom: 10,
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.textColorPrimaryDark,
                                    marginTop: 5,
                                    paddingVertical: 5,
                                    fontSize: 15,
                                }}
                            >
                                About
                            </Text>
                            <Text
                                style={{
                                    color: theme.textColorSecondaryDark,
                                    lineHeight: 20,
                                }}
                                numberOfLines={more ? 100 : 2}
                                onPress={() => setMore(!more)}
                                ellipsizeMode="clip"
                            >
                                {item.novelSummary}
                            </Text>
                            <Text
                                style={{
                                    color: theme.colorAccentDark,
                                    fontWeight: "bold",
                                    position: "absolute",
                                    bottom: 0,
                                    right: 15,
                                    backgroundColor: "black",
                                    paddingLeft: 5,
                                }}
                                onPress={() => setMore(!more)}
                            >
                                {more ? "Less" : "More"}
                            </Text>
                        </View>
                    )}
                    <FlatList
                        contentContainerStyle={{
                            paddingHorizontal: 15,
                            marginBottom: 15,
                        }}
                        horizontal
                        data={item["Genre(s)"] && item["Genre(s)"].split(",")}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <Text
                                style={[
                                    styles.genre,
                                    {
                                        color: theme.colorAccentDark,
                                        borderColor: theme.colorAccentDark,
                                    },
                                ]}
                            >
                                {item}
                            </Text>
                        )}
                    />
                </>
            )}
        </>
    );
};

export default NovelInfoHeader;

const styles = StyleSheet.create({
    nameContainer: {
        flex: 1,
        width: "100%",
        marginHorizontal: 15,
        // justifyContent: "center",
    },
    background: {
        height: 240,
    },
    linearGradient: {
        height: "100%",
        backgroundColor: "rgba(256, 256, 256, 0.5)",
    },
    detailsContainer: {
        flex: 1,
        flexDirection: "row",
        margin: 15,
    },
    logo: {
        height: 180,
        width: 120,
        margin: 3.2,
        borderRadius: 6,
    },
    genre: {
        borderRadius: 24,
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
        fontSize: 20,
    },
});

import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Image,
    ImageBackground,
    Text,
    FlatList,
    ScrollView,
    RefreshControl,
} from "react-native";
import {
    Appbar,
    TouchableRipple,
    IconButton,
    Button,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "../theming/theme";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const NovelItem = ({ route, navigation }) => {
    const item = route.params;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(true);

    const [novel, setNovel] = useState();
    const [chapters, setChapters] = useState();
    const [more, setMore] = useState(false);

    const [libraryStatus, setlibraryStatus] = useState();

    const getNovel = () => {
        fetch(`http://192.168.1.39:5000/api/novel/${item.novelUrl}`)
            .then((response) => response.json())
            .then((json) => {
                setNovel(json);
                setChapters(json.novelChapters);
                checkIfExistsInLibrary(json.novelUrl);
            })
            .catch((error) => console.error(error))
            .finally(() => {
                setRefreshing(false);
                setLoading(false);
            });
    };

    const insertToLibrary = () => {
        if (libraryStatus === 0) {
            db.transaction((tx) => {
                tx.executeSql(
                    "INSERT INTO LibraryTable (novelId, novelName, novelCover, novelSummary, alternative, author, genre, type, releaseDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        novel.novelUrl,
                        novel.novelName,
                        novel.novelCover,
                        novel.novelSummary,
                        novel.novelDetails.Alternative,
                        novel.novelDetails["Author(s)"],
                        novel.novelDetails["Genre(s)"],
                        novel.novelDetails.Type,
                        novel.novelDetails.Release,
                        novel.novelDetails.Status,
                    ]
                );
                console.log("Inserted Novel");

                novel.novelChapters.map((chap) =>
                    tx.executeSql(
                        "INSERT INTO ChapterTable (chapterId, chapterName, releaseDate, novelId) values (?, ?, ?, ?)",
                        [
                            chap.chapterUrl,
                            chap.chapterName,
                            chap.releaseDate,
                            novel.novelUrl,
                        ]
                    )
                );
                setlibraryStatus(1);
            });
        } else {
            db.transaction((tx) => {
                tx.executeSql(
                    "DELETE FROM LibraryTable WHERE novelId=?",
                    [novel.novelUrl],
                    (txObj, res) => {
                        console.log("DELETED NOVEL FROM TABLE");
                    },
                    (txObj, error) => console.log("Error ", error)
                );
                tx.executeSql("DELETE FROM ChapterTable WHERE novelId=?", [
                    novel.novelUrl,
                ]);
                console.log("Removed Novel");
                setlibraryStatus(0);
            });
        }
    };

    const checkIfExistsInLibrary = (id) => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM LibraryTable WHERE novelId=?",
                [id],
                (txObj, res) => {
                    console.log(res.rows.length);
                    if (res.rows.length === 0) {
                        console.log("Not In Library");
                        setlibraryStatus(0);
                    } else {
                        console.log("In Library");
                        setlibraryStatus(1);
                    }
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    useEffect(() => {
        getNovel();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        getNovel();
    };

    return (
        <>
            <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
                <Appbar.BackAction
                    onPress={() => {
                        navigation.goBack();
                    }}
                    color={"white"}
                    size={26}
                    style={{ marginRight: 0 }}
                />
                <Appbar.Content
                    title={item.novelName}
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                />
            </Appbar.Header>

            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["white"]}
                        progressBackgroundColor={theme.colorAccentDark}
                    />
                }
            >
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
                                        { color: theme.textColorPrimaryDark },
                                    ]}
                                >
                                    {item.novelName}
                                </Text>
                                {!loading && (
                                    <>
                                        <Text
                                            style={{
                                                color:
                                                    theme.textColorSecondaryDark,
                                                marginVertical: 3,
                                                fontSize: 15,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {novel.novelDetails[
                                                "Alternative"
                                            ].replace(",", ", ")}
                                        </Text>
                                        <Text
                                            style={{
                                                color:
                                                    theme.textColorSecondaryDark,
                                                marginVertical: 3,
                                                fontSize: 15,
                                            }}
                                        >
                                            {novel.novelDetails[
                                                "Author(s)"
                                            ].replace(",", ", ")}
                                        </Text>
                                        <Text
                                            style={{
                                                color:
                                                    theme.textColorSecondaryDark,
                                                marginVertical: 3,
                                                fontSize: 15,
                                            }}
                                        >
                                            {novel.novelDetails["Release"]}
                                        </Text>
                                        <Text
                                            style={{
                                                color:
                                                    theme.textColorSecondaryDark,
                                                marginVertical: 3,
                                                fontSize: 15,
                                            }}
                                        >
                                            {novel.novelDetails["Status"] +
                                                " • " +
                                                novel.novelDetails["Type"]}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </View>
                    </LinearGradient>
                </ImageBackground>
                {!loading && (
                    <>
                        <Button
                            color={theme.textColorPrimaryDark}
                            style={[
                                {
                                    backgroundColor: theme.colorAccentDark,
                                    marginHorizontal: 15,
                                },
                                novel.novelSummary.length === 0 && {
                                    marginBottom: 20,
                                },
                            ]}
                            uppercase={false}
                            labelStyle={{ letterSpacing: 0 }}
                            onPress={() => insertToLibrary()}
                        >
                            {libraryStatus === 0
                                ? "Add to library"
                                : "In Library"}
                        </Button>
                        {/* <Button
                            color={theme.textColorPrimaryDark}
                            style={{
                                backgroundColor: theme.colorAccentDark,
                                marginHorizontal: 15,
                            }}
                            uppercase={false}
                            labelStyle={{ letterSpacing: 0 }}
                            onPress={() =>
                                checkIfExistsInLibrary(novel.novelUrl)
                            }
                        >
                            Check
                        </Button> */}
                        {novel.novelSummary.length > 0 && (
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
                            data={novel.novelDetails["Genre(s)"].split(",")}
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

                        <TouchableRipple
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                            onPress={() =>
                                setChapters((chapters) => chapters.reverse())
                            }
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
                                    {chapters.length + "  Chapters"}
                                </Text>
                                <IconButton
                                    icon="filter-variant"
                                    color={theme.textColorPrimaryDark}
                                    size={20}
                                    onPress={() =>
                                        setChapters((chapters) =>
                                            chapters.reverse()
                                        )
                                    }
                                />
                            </>
                        </TouchableRipple>
                        <FlatList
                            data={chapters}
                            extraData={chapters}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item) => item.chapterUrl}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={10}
                            initialNumToRender={10}
                            renderItem={({ item }) => (
                                <TouchableRipple
                                    style={{
                                        paddingHorizontal: 15,
                                        paddingVertical: 12,
                                    }}
                                    onPress={() =>
                                        navigation.navigate("ChapterItem", {
                                            chapterUrl: item.chapterUrl,
                                        })
                                    }
                                    rippleColor={theme.rippleColorDark}
                                >
                                    <>
                                        <Text
                                            style={{
                                                color:
                                                    theme.textColorPrimaryDark,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {item.chapterName}
                                        </Text>
                                        <Text
                                            style={{
                                                color:
                                                    theme.textColorSecondaryDark,
                                                marginTop: 5,
                                                fontSize: 13,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {item.releaseDate}
                                        </Text>
                                    </>
                                </TouchableRipple>
                            )}
                        />
                    </>
                )}
            </ScrollView>
        </>
    );
};

export default NovelItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
    },
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

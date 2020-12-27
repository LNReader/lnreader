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
    ToastAndroid,
    ActivityIndicator,
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
    const [refreshing, setRefreshing] = useState(false);

    const [novel, setNovel] = useState(item);
    const [chapters, setChapters] = useState();
    const [more, setMore] = useState(false);

    const [libraryStatus, setlibraryStatus] = useState();
    // const [sort, setSort] = useState("DESC");

    const getNovel = () => {
        fetch(`http://192.168.1.42:5000/api/1/novel/${item.novelUrl}`)
            .then((response) => response.json())
            .then((json) => {
                setNovel(json);
                setChapters(json.novelChapters);
            })
            .catch((error) => console.error(error))
            .finally(() => {
                setRefreshing(false);
                setLoading(false);
            });
    };

    const getNovelFromDb = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM LibraryTable WHERE novelUrl=?",
                [item.novelUrl],
                (txObj, results) => {
                    let len = results.rows.length;
                    for (let i = 0; i < len; i++) {
                        let row = results.rows.item(i);
                        setNovel(row);
                    }
                },
                (txObj, error) => console.log("Error ", error)
            );
            tx.executeSql(
                "SELECT * FROM ChapterTable WHERE novelUrl=?",
                [item.novelUrl],
                (txObj, { rows: { _array } }) => {
                    setChapters(_array);
                    setRefreshing(false);
                    setLoading(false);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    // const sortChapters = () => {
    //     setRefreshing(true);
    //     if (libraryStatus === 0) {
    //         setChapters((chapters) => chapters.reverse());
    //     } else {
    //         db.transaction((tx) => {
    //             tx.executeSql(
    //                 `SELECT * FROM ChapterTable WHERE novelUrl=? ORDER BY chapterId ${sort}`,
    //                 [item.novelUrl],
    //                 (txObj, { rows: { _array } }) => {
    //                     setChapters(_array);
    //                     sort === "ASC" ? setSort("DESC") : setSort("ASC");
    //                     setRefreshing(false);
    //                 },
    //                 (txObj, error) => console.log("Error ", error)
    //             );
    //         });
    //     }
    // };

    const insertToLibrary = () => {
        if (libraryStatus === 0) {
            db.transaction((tx) => {
                tx.executeSql(
                    "INSERT INTO LibraryTable (novelUrl, novelName, novelCover, novelSummary, Alternative, `Author(s)`, `Genre(s)`, Type, `Release`, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        item.novelUrl,
                        novel.novelName,
                        novel.novelCover,
                        novel.novelSummary,
                        novel.Alternative,
                        novel["Author(s)"],
                        novel["Genre(s)"],
                        novel.Type,
                        novel.Release,
                        novel.Status,
                    ],
                    (tx, res) =>
                        ToastAndroid.show(
                            "Added to library",
                            ToastAndroid.SHORT
                        ),
                    (txObj, error) => console.log("Error ", error)
                );

                chapters.map((chap) =>
                    tx.executeSql(
                        "INSERT INTO ChapterTable (chapterUrl, chapterName, releaseDate, novelUrl) values (?, ?, ?, ?)",
                        [
                            chap.chapterUrl,
                            chap.chapterName,
                            chap.releaseDate,
                            item.novelUrl,
                        ]
                    )
                );
                setlibraryStatus(1);
            });
        } else {
            db.transaction((tx) => {
                tx.executeSql(
                    "DELETE FROM LibraryTable WHERE novelUrl=?",
                    [item.novelUrl],
                    (txObj, res) => {
                        ToastAndroid.show(
                            "Removed from library",
                            ToastAndroid.SHORT
                        );
                    },
                    (txObj, error) => console.log("Error ", error)
                );
                tx.executeSql("DELETE FROM ChapterTable WHERE novelUrl=?", [
                    item.novelUrl,
                ]);
                console.log("Removed Novel");
                setlibraryStatus(0);
            });
        }
    };

    const checkIfExistsInLibrary = (id) => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM LibraryTable WHERE novelUrl=?",
                [id],
                (txObj, res) => {
                    console.log(res.rows.length);
                    if (res.rows.length === 0) {
                        setRefreshing(true);
                        // console.log("Not In Library");
                        getNovel();
                        setlibraryStatus(0);
                    } else {
                        // console.log("In Library");
                        getNovelFromDb();
                        setlibraryStatus(1);
                    }
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    useEffect(() => {
        checkIfExistsInLibrary(item.novelUrl);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        checkIfExistsInLibrary(item.novelUrl);
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

            <View style={styles.container}>
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
                                        color: theme.textColorPrimaryDark,
                                    }}
                                    numberOfLines={1}
                                >
                                    {item.chapterName}
                                </Text>
                                <Text
                                    style={{
                                        color: theme.textColorSecondaryDark,
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
                    ListHeaderComponent={
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
                                                        color:
                                                            theme.textColorPrimaryDark,
                                                    },
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
                                                        {novel.Alternative.replace(
                                                            ",",
                                                            ", "
                                                        )}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            color:
                                                                theme.textColorSecondaryDark,
                                                            marginVertical: 3,
                                                            fontSize: 15,
                                                        }}
                                                    >
                                                        {novel[
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
                                                        {novel["Release"]}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            color:
                                                                theme.textColorSecondaryDark,
                                                            marginVertical: 3,
                                                            fontSize: 15,
                                                        }}
                                                    >
                                                        {novel["Status"] +
                                                            " • " +
                                                            novel["Type"]}
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
                                                backgroundColor:
                                                    theme.colorAccentDark,
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
                                    {novel.novelSummary.length > 0 && (
                                        <View
                                            style={{
                                                paddingHorizontal: 15,
                                                marginBottom: 10,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color:
                                                        theme.textColorPrimaryDark,
                                                    marginTop: 5,
                                                    paddingVertical: 5,
                                                    fontSize: 15,
                                                }}
                                            >
                                                About
                                            </Text>
                                            <Text
                                                style={{
                                                    color:
                                                        theme.textColorSecondaryDark,
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
                                                    color:
                                                        theme.colorAccentDark,
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
                                        data={novel["Genre(s)"].split(",")}
                                        keyExtractor={(item) => item}
                                        renderItem={({ item }) => (
                                            <Text
                                                style={[
                                                    styles.genre,
                                                    {
                                                        color:
                                                            theme.colorAccentDark,
                                                        borderColor:
                                                            theme.colorAccentDark,
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
                                        // onPress={() => sortChapters()}
                                        rippleColor={theme.rippleColorDark}
                                    >
                                        <>
                                            <Text
                                                style={{
                                                    color:
                                                        theme.textColorPrimaryDark,
                                                    paddingHorizontal: 15,
                                                    paddingVertical: 5,
                                                    fontSize: 15,
                                                }}
                                            >
                                                {chapters.length + "  Chapters"}
                                            </Text>
                                            <IconButton
                                                icon="filter-variant"
                                                color={
                                                    theme.textColorPrimaryDark
                                                }
                                                size={20}
                                                // onPress={() => sortChapters()}
                                                disabled
                                            />
                                        </>
                                    </TouchableRipple>
                                </>
                            )}
                        </>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["white"]}
                            progressBackgroundColor={theme.colorAccentDark}
                        />
                    }
                />
            </View>
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

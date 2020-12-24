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
import { Appbar } from "react-native-paper";
import { theme } from "../theming/theme";

const ChapterItem = ({ route, navigation }) => {
    const { chapterName, chapterUrl } = route.params;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(true);

    const [chapter, setChapter] = useState();

    useEffect(() => {
        getChapter();
    }, []);

    const getChapter = () => {
        fetch(`http://192.168.1.38:5000/api/${chapterUrl}`)
            .then((response) => response.json())
            .then((json) => setChapter(json))
            .catch((error) => console.error(error))
            .finally(() => {
                setRefreshing(false);
                setLoading(false);
            });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        getChapter();
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
                    title={loading ? "Chapter" : chapter.chapterName}
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                />
                {!loading && (
                    <>
                        <Appbar.Action
                            icon="chevron-left"
                            size={26}
                            disabled={!chapter.prevChapter}
                            onPress={() => {
                                navigation.navigate("ChapterItem", {
                                    chapterUrl: chapter.prevChapter,
                                });
                            }}
                            color={"white"}
                        />
                        <Appbar.Action
                            icon="chevron-right"
                            size={26}
                            disabled={!chapter.nextChapter}
                            onPress={() => {
                                navigation.navigate("ChapterItem", {
                                    chapterUrl: chapter.nextChapter,
                                });
                            }}
                            color={"white"}
                        />
                    </>
                )}
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
                {!loading && (
                    <Text
                        style={{
                            color: theme.textColorPrimaryDark,
                            lineHeight: 20,
                        }}
                    >
                        {chapter.chapterText.trim()}
                    </Text>
                )}
            </ScrollView>
        </>
    );
};

export default ChapterItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202125",
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
});

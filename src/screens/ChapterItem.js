import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Image,
    ImageBackground,
    Text,
    FlatList,
    ScrollView,
    Platform,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
} from "react-native";

import { Appbar } from "react-native-paper";
import { theme } from "../theming/theme";
import { CollapsibleHeaderScrollView } from "react-native-collapsible-header-views";

const ChapterItem = ({ route, navigation }) => {
    const { chapterName, chapterUrl } = route.params;

    const [loading, setLoading] = useState(true);

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
                setLoading(false);
            });
    };

    return (
        <>
            <CollapsibleHeaderScrollView
                headerContainerBackgroundColor={theme.colorDarkPrimary}
                CollapsibleHeaderComponent={
                    <Appbar.Header
                        style={{ backgroundColor: theme.colorDarkPrimary }}
                    >
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
                                        navigation.push("ChapterItem", {
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
                                        navigation.push("ChapterItem", {
                                            chapterUrl: chapter.nextChapter,
                                        });
                                    }}
                                    color={"white"}
                                />
                            </>
                        )}
                    </Appbar.Header>
                }
                headerHeight={100}
                contentContainerStyle={styles.container}
            >
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ActivityIndicator
                            size="large"
                            color={theme.colorAccentDark}
                        />
                    </View>
                ) : (
                    <Text
                        style={{
                            color: theme.textColorPrimaryDark,
                            lineHeight: 20,
                            paddingVertical: 15,
                        }}
                    >
                        {chapter.chapterText.trim()}
                    </Text>
                )}
            </CollapsibleHeaderScrollView>
        </>
    );
};

export default ChapterItem;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#202125",
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
});

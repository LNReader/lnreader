import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import BottomSheet from "../components/ChapterBottomSheet";

import { Appbar, Provider, Portal } from "react-native-paper";
import { theme } from "../theming/theme";
import { CollapsibleHeaderScrollView } from "react-native-collapsible-header-views";
import { linear } from "react-native/Libraries/Animated/src/Easing";

const ChapterItem = ({ route, navigation }) => {
    const { chapterUrl } = route.params;

    const [loading, setLoading] = useState(true);

    const [chapter, setChapter] = useState();

    const [size, setSize] = useState(14);

    const [readerTheme, setReaderTheme] = useState(1);

    useEffect(() => {
        getChapter();
    }, []);

    const getChapter = () => {
        fetch(`http://192.168.1.39:5000/api/${chapterUrl}`)
            .then((response) => response.json())
            .then((json) => setChapter(json))
            .catch((error) => console.error(error))
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Provider>
            <CollapsibleHeaderScrollView
                headerContainerBackgroundColor={"rgba(0,0,0,0)"}
                // statusBarHeight={60}
                CollapsibleHeaderComponent={
                    <Appbar.Header
                        style={{
                            backgroundColor: "rgba(0,0,0,0.2)",
                            elevation: 0,
                        }}
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
                                <Appbar.Action
                                    icon="dots-vertical"
                                    size={26}
                                    onPress={() =>
                                        _panel.show({ velocity: -1.5 })
                                    }
                                    color={"white"}
                                />
                            </>
                        )}
                    </Appbar.Header>
                }
                headerHeight={100}
                contentContainerStyle={[
                    styles.container,
                    readerTheme === 1 && {
                        backgroundColor: theme.colorDarkPrimary,
                    },
                    readerTheme === 3 && {
                        backgroundColor: "#F4ECD8",
                    },
                ]}
                onScroll={() => _panel.hide()}
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
                        style={[
                            {
                                paddingVertical: 15,
                                fontSize: size,
                            },
                            readerTheme === 1
                                ? { color: theme.textColorSecondaryDark }
                                : { color: "black" },
                            size === 16
                                ? { lineHeight: 20 }
                                : size === 20
                                ? { lineHeight: 25 }
                                : size === 12 && { lineHeight: 20 },
                        ]}
                    >
                        {chapter.chapterText.trim()}
                    </Text>
                )}
                <Portal>
                    <BottomSheet
                        bottomSheetRef={(c) => (_panel = c)}
                        setSize={setSize}
                        size={size}
                        setReaderTheme={setReaderTheme}
                        readerTheme={readerTheme}
                    />
                </Portal>
            </CollapsibleHeaderScrollView>
        </Provider>
    );
};

export default ChapterItem;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        // backgroundColor: "#202125",
        // backgroundColor: "#000000",
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
});

import React from "react";
import { theme } from "../theming/theme";
import moment from "moment";
import { StyleSheet, View, Text, FlatList, Image } from "react-native";
import { TouchableRipple, IconButton, Appbar } from "react-native-paper";

const HistoryCard = ({ item, deleteHistory, navigation }) => (
    <TouchableRipple
        style={styles.historyCard}
        rippleColor={theme.rippleColorDark}
        borderless
        onPress={() =>
            navigation.navigate("NovelItem", {
                novelName: item.novelName,
                novelCover: item.novelCover,
                extensionId: item.extensionId,
                novelUrl: item.novelUrl,
            })
        }
    >
        <>
            <Image
                source={{ uri: item.novelCover }}
                style={{
                    height: 80,
                    width: 57,
                    borderTopLeftRadius: 4,
                    borderBottomLeftRadius: 4,
                }}
            />
            <View
                style={{
                    marginLeft: 15,
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <View>
                    <Text
                        style={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: 16,
                        }}
                    >
                        {item.novelName}
                    </Text>
                    <Text
                        style={{
                            color: theme.textColorSecondaryDark,
                            marginTop: 2,
                        }}
                        numberOfLines={1}
                    >
                        {`Ch. ${item.chapterName
                            .replace(/^\D+/g, "")
                            .substring(0, 4)} - ${moment(
                            item.lastRead
                        ).calendar()}`}
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                    }}
                >
                    <IconButton
                        icon="delete-outline"
                        size={24}
                        color={theme.textColorPrimaryDark}
                        style={{
                            marginRight: 0,
                        }}
                        onPress={() => deleteHistory(item.novelUrl)}
                    />
                    <IconButton
                        icon="play"
                        size={24}
                        color={theme.textColorPrimaryDark}
                        style={{ marginRight: 10 }}
                        onPress={() =>
                            navigation.navigate("ChapterItem", {
                                chapterUrl: item.chapterUrl,
                                extensionId: item.extensionId,
                                novelUrl: item.novelUrl,
                                novelName: item.novelName,
                                novelCover: item.novelCover,
                                chapterName: item.chapterName,
                            })
                        }
                    />
                </View>
            </View>
        </>
    </TouchableRipple>
);

export default HistoryCard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202125",
        backgroundColor: "#000000",
        padding: 10,
    },
    historyCard: {
        // backgroundColor: "pink",
        // paddingVertical: 10,
        // marginVertical: 5,
        // paddingHorizontal: 20,
        marginTop: 10,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
    },
});

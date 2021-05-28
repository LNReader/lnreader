import React from "react";

import { StyleSheet, View, Text, Image } from "react-native";
import { TouchableRipple, IconButton } from "react-native-paper";

import moment from "moment";

import { useDispatch } from "react-redux";
import { setNovel } from "../../../redux/novel/novel.actions";
import { parseChapterNumber } from "../../../Services/utils/helpers";

const HistoryCard = ({ item, deleteHistoryAction, navigation, theme }) => {
    const dispatch = useDispatch();
    return (
        <TouchableRipple
            style={styles.historyCard}
            rippleColor={theme.rippleColor}
            borderless
            onPress={() => {
                navigation.navigate("Novel", item);
                dispatch(setNovel(item));
            }}
        >
            <>
                <Image
                    source={{ uri: item.novelCover }}
                    style={styles.historyCover}
                />
                <View style={styles.historyText}>
                    <View style={{ flex: 0.9 }}>
                        <Text
                            style={{
                                color: theme.textColorPrimary,
                                fontWeight: "bold",
                                fontSize: 16,
                            }}
                            numberOfLines={1}
                        >
                            {item.novelName}
                        </Text>
                        <Text
                            style={{
                                color: theme.textColorSecondary,
                                marginTop: 2,
                            }}
                            numberOfLines={1}
                        >
                            {`Ch. ${parseChapterNumber(
                                item.chapterName
                            )} - ${moment(item.historyTimeRead)
                                .format("h:mm a")
                                .toUpperCase()}`}
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <IconButton
                            icon="delete-outline"
                            size={22}
                            color={theme.textColorPrimary}
                            style={{
                                marginRight: 0,
                            }}
                            onPress={() => deleteHistoryAction(item.novelId)}
                        />
                        <IconButton
                            icon="play"
                            size={24}
                            color={theme.textColorPrimary}
                            style={{ marginRight: 0 }}
                            onPress={() =>
                                navigation.navigate("Chapter", {
                                    chapterId: item.historyChapterId,
                                    chapterUrl: item.chapterUrl,
                                    sourceId: item.sourceId,
                                    novelUrl: item.novelUrl,
                                    novelId: item.novelId,
                                    chapterName: item.chapterName,
                                    novelName: item.novelName,
                                })
                            }
                        />
                    </View>
                </View>
            </>
        </TouchableRipple>
    );
};

export default HistoryCard;

const styles = StyleSheet.create({
    historyCard: {
        marginVertical: 8,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
    },
    historyCover: {
        height: 80,
        width: 57,
        borderRadius: 4,
    },
    historyText: {
        marginLeft: 15,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { TouchableRipple } from "react-native-paper";
import moment from "moment";

const UpdateCard = ({ item, theme, onPress }) => {
    return (
        <TouchableRipple
            style={styles.updateCard}
            onPress={onPress}
            rippleColor={theme.rippleColor}
            borderless
        >
            <>
                <Image
                    source={{ uri: item.novelCover }}
                    style={styles.updateIcon}
                />
                <View style={styles.chapterDetails}>
                    <Text
                        style={{
                            color: theme.textColorPrimary,
                            fontSize: 14,
                        }}
                        numberOfLines={1}
                    >
                        {item.novelName}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text
                            style={{
                                color: theme.textColorPrimary,
                                fontSize: 12,
                            }}
                        >
                            {`${item.chapterName} · ${moment(
                                item.updateTime
                            ).calendar()}`}
                        </Text>
                    </View>
                </View>
            </>
        </TouchableRipple>
    );
};

export default UpdateCard;

const styles = StyleSheet.create({
    updateCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    updateIcon: {
        width: 42,
        height: 42,
        borderRadius: 4,
    },
    chapterDetails: {
        flex: 1,
        marginLeft: 16,
    },
});

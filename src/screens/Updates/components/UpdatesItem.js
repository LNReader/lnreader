import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import FastImage from "react-native-fast-image";

const UpdateCard = ({ item, theme, onPress, onPressCover }) => {
    return (
        <Pressable
            style={styles.updateCard}
            onPress={onPress}
            android_ripple={{ color: theme.rippleColor }}
        >
            <>
                <Pressable onPress={onPressCover}>
                    <FastImage
                        source={{ uri: item.novelCover }}
                        style={styles.updateIcon}
                    />
                </Pressable>
                <View style={styles.chapterDetails}>
                    <Text
                        style={[
                            { color: theme.textColorPrimary, fontSize: 14 },
                            item.read && {
                                color: theme.textColorHint,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {item.novelName}
                    </Text>
                    <Text
                        style={[
                            { color: theme.textColorPrimary, fontSize: 12 },
                            item.read && {
                                color: theme.textColorHint,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {item.chapterName}
                    </Text>
                </View>
            </>
        </Pressable>
    );
};

export default UpdateCard;

const styles = StyleSheet.create({
    updateCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
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

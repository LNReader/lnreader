import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import FastImage from "react-native-fast-image";
import { TouchableRipple } from "react-native-paper";

const ListView = ({
    item,
    downloadBadge,
    unreadBadge,
    inLibraryBadge,
    theme,
    onPress,
}) => {
    return (
        <TouchableRipple
            borderless
            centered
            rippleColor={theme.rippleColor}
            style={styles.listView}
            onPress={onPress}
        >
            <>
                <FastImage
                    source={{ uri: item.novelCover }}
                    style={styles.extensionIcon}
                />
                <Text
                    style={[
                        { color: theme.textColorPrimary },
                        styles.novelName,
                    ]}
                    numberOfLines={1}
                >
                    {item.novelName}
                </Text>
                <View style={styles.badgeContainer}>
                    {downloadBadge}
                    {unreadBadge}
                    {inLibraryBadge}
                </View>
            </>
        </TouchableRipple>
    );
};

export default ListView;

const styles = StyleSheet.create({
    listView: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    extensionIcon: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    novelName: {
        flex: 1,
        marginLeft: 16,
        fontSize: 15,
        paddingRight: 8,
        flexWrap: "wrap",
    },
    badgeContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
});

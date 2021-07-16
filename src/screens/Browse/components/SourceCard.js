import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";

import { Button, IconButton } from "react-native-paper";

import { pinSourceAction } from "../../../redux/source/source.actions";

const ExtensionCard = ({ item, theme, isPinned, dispatch, navigation }) => {
    const { sourceId, sourceName, icon, lang } = item;

    const navigateToExtension = () =>
        navigation.navigate("Extension", {
            sourceId: item.sourceId,
            sourceName: item.sourceName,
            url: item.url,
        });

    return (
        <Pressable
            style={styles.extensionCard}
            onPress={navigateToExtension}
            android_ripple={{ color: theme.rippleColor }}
        >
            <Image source={{ uri: icon }} style={styles.extensionIcon} />
            <View style={styles.extensionDetails}>
                <View>
                    <Text
                        style={{
                            color: theme.textColorPrimary,
                            fontSize: 14,
                        }}
                    >
                        {sourceName}
                    </Text>
                    <Text
                        style={{
                            color: theme.textColorSecondary,
                            fontSize: 12,
                        }}
                    >
                        {lang}
                    </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Button
                        labelStyle={{ letterSpacing: 0 }}
                        uppercase={false}
                        color={theme.colorAccent}
                        onPress={navigateToExtension}
                    >
                        Browse
                    </Button>
                    <IconButton
                        icon={isPinned ? "pin" : "pin-outline"}
                        animated
                        size={21}
                        onPress={() => dispatch(pinSourceAction(sourceId))}
                        color={
                            isPinned
                                ? theme.colorAccent
                                : theme.textColorSecondary
                        }
                        style={{ margin: 2 }}
                    />
                </View>
            </View>
        </Pressable>
    );
};

export default ExtensionCard;

const styles = StyleSheet.create({
    extensionCard: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    extensionIcon: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    extensionDetails: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginLeft: 16,
    },
    sourceStatus: {
        color: "#C14033",
        fontSize: 12,
        marginLeft: 5,
    },
});

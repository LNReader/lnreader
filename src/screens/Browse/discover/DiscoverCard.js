import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";

import { Button } from "react-native-paper";

const DiscoverCard = ({ icon, label, onPress, theme }) => {
    return (
        <Pressable
            style={styles.discoverCard}
            onPress={onPress}
            android_ripple={{ color: theme.rippleColor }}
        >
            <Image source={icon} style={styles.discoverIcon} />
            <View style={styles.label}>
                <Text
                    style={{
                        color: theme.textColorPrimary,
                        fontSize: 14,
                    }}
                >
                    {label}
                </Text>
                <Button
                    labelStyle={{ letterSpacing: 0 }}
                    uppercase={false}
                    color={theme.colorAccent}
                    onPress={onPress}
                >
                    Browse
                </Button>
            </View>
        </Pressable>
    );
};

export default DiscoverCard;

const styles = StyleSheet.create({
    discoverCard: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    discoverIcon: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    label: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginLeft: 16,
    },
});

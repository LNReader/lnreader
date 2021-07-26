import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";

const icons = ["(･o･;)", "Σ(ಠ_ಠ)", "ಥ_ಥ", "(˘･_･˘)", "(；￣Д￣)", "(･Д･。"];

export const ErrorView = ({ errorName, actions, theme }) => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={[styles.emptyViewIcon, { color: theme.textColorHint }]}>
            {icons[Math.floor(Math.random() * 5)]}
        </Text>
        <Text style={[styles.emptyViewText, { color: theme.textColorHint }]}>
            {errorName}
        </Text>
        <View style={{ flexDirection: "row" }}>
            {actions.map((action) => (
                <View
                    style={{
                        borderRadius: 4,
                        overflow: "hidden",
                        margin: 16,
                    }}
                >
                    <Pressable
                        android_ripple={{
                            color: theme.rippleColor,
                            borderless: false,
                        }}
                        onPress={action.onPress}
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                            paddingBottom: 8,
                            paddingHorizontal: 20,
                        }}
                    >
                        <IconButton
                            icon={action.icon}
                            color={theme.textColorHint}
                            size={24}
                            style={{ margin: 0 }}
                        />
                        <Text
                            style={{
                                fontSize: 12,
                                color: theme.textColorHint,
                            }}
                        >
                            {action.name}
                        </Text>
                    </Pressable>
                </View>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    emptyViewContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyViewIcon: {
        fontSize: 45,
    },
    emptyViewText: {
        fontWeight: "bold",
        marginTop: 10,
        textAlign: "center",
        paddingHorizontal: 30,
    },
});

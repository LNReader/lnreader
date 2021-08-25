import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export const ThemePicker = ({ theme, currentTheme, onPress }) => (
    <View
        style={{
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
        }}
    >
        <View
            style={{
                backgroundColor: theme.colorPrimaryDark,
                borderWidth: 3.6,
                borderColor:
                    currentTheme.id == theme.id
                        ? theme.colorAccent
                        : currentTheme.colorPrimaryDark,
                width: 95,
                height: 140,
                borderRadius: 16,
                overflow: "hidden",
                elevation: 1,
            }}
        >
            <Pressable style={{ flex: 1 }} onPress={onPress}>
                {currentTheme.id == theme.id && (
                    <MaterialCommunityIcons
                        name="check"
                        color={theme.colorButtonText}
                        size={15}
                        style={{
                            backgroundColor: theme.colorAccent,
                            position: "absolute",
                            top: 5,
                            right: 5,
                            elevation: 2,
                            borderRadius: 50,
                            padding: 1.6,
                        }}
                    />
                )}
                <View
                    style={{
                        height: 20,
                        backgroundColor: theme.colorPrimary,
                        elevation: 1,
                        justifyContent: "center",
                    }}
                >
                    <View
                        style={{
                            backgroundColor: theme.textColorPrimary,
                            width: 44,
                            height: 10,
                            marginLeft: 8,
                            borderRadius: 50,
                        }}
                    />
                </View>
                <View style={{ padding: 8 }}>
                    <View
                        style={{
                            height: 18,
                            backgroundColor: theme.textColorSecondary,
                            borderRadius: 4,
                        }}
                    />
                    <View style={{ paddingVertical: 4, flexDirection: "row" }}>
                        <View
                            style={{
                                height: 10,
                                width: 44,
                                backgroundColor: theme.textColorPrimary,
                                borderRadius: 50,
                            }}
                        />
                        <View
                            style={{
                                height: 10,
                                width: 16,
                                marginLeft: 4,
                                backgroundColor: theme.colorAccent,
                                borderRadius: 50,
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <View
                            style={{
                                height: 10,
                                width: 24,
                                backgroundColor: theme.textColorSecondary,
                                borderRadius: 50,
                            }}
                        />
                        <View
                            style={{
                                height: 10,
                                width: 24,
                                backgroundColor: theme.textColorSecondary,
                                borderRadius: 50,
                                marginLeft: 4,
                            }}
                        />
                    </View>
                </View>
                <View
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 24,
                        backgroundColor: theme.colorPrimary,
                        justifyContent: "center",
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexDirection: "row",
                            paddingHorizontal: 16,
                        }}
                    >
                        <View
                            style={{
                                height: 12,
                                width: 12,
                                borderRadius: 50,
                                backgroundColor: theme.textColorPrimary,
                                opacity: 0.54,
                            }}
                        />
                        <View
                            style={{
                                height: 12,
                                width: 12,
                                borderRadius: 50,
                                backgroundColor: theme.colorAccent,
                            }}
                        />
                        <View
                            style={{
                                height: 12,
                                width: 12,
                                borderRadius: 50,
                                backgroundColor: theme.textColorPrimary,
                                opacity: 0.54,
                            }}
                        />
                    </View>
                </View>
            </Pressable>
        </View>
        <Text
            style={{
                color: currentTheme.textColorPrimary,
                fontSize: 12,
                paddingVertical: 4,
            }}
        >
            {theme.name}
        </Text>
    </View>
);

const styles = StyleSheet.create({});

import React, { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import {
    TouchableRipple,
    IconButton,
    Appbar as MaterialAppbar,
} from "react-native-paper";
import Constants from "expo-constants";

import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

export const Appbar = ({ title, onBackAction, style, children }) => {
    const theme = useSelector((state) => state.settingsReducer.theme);

    return (
        <MaterialAppbar.Header
            style={[{ backgroundColor: theme.colorPrimary }, style]}
        >
            {onBackAction && (
                <MaterialAppbar.BackAction onPress={onBackAction} />
            )}
            <MaterialAppbar.Content
                title={title}
                titleStyle={{ color: theme.textColorPrimary }}
            />
            {children}
        </MaterialAppbar.Header>
    );
};

const styles = StyleSheet.create({
    searchAppbarContainer: {
        marginTop: Constants.statusBarHeight + 8,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 12,
        borderRadius: 8,
        marginHorizontal: 12,
        elevation: 2,
    },
});

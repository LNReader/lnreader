import React from "react";

import { Appbar as MaterialAppbar } from "react-native-paper";

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

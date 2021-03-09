import React, { useState } from "react";
import { Checkbox } from "react-native-paper";
import { useSelector } from "react-redux";

export const DisplayCheckbox = ({ displayMode, onPress, value }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <Checkbox.Item
            label={value.charAt(0).toUpperCase() + value.slice(1)}
            labelStyle={{ color: theme.textColorPrimaryDark }}
            status={displayMode === value ? "checked" : "unchecked"}
            mode="ios"
            uncheckedColor={theme.textColorSecondaryDark}
            color={theme.colorAccentDark}
            onPress={onPress}
        />
    );
};

export const ThemeCheckbox = ({ onPress, label, checked }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <Checkbox.Item
            label={label}
            labelStyle={{ color: theme.textColorPrimaryDark }}
            status={checked ? "checked" : "unchecked"}
            mode="ios"
            uncheckedColor={theme.textColorSecondaryDark}
            color={theme.colorAccentDark}
            onPress={onPress}
        />
    );
};

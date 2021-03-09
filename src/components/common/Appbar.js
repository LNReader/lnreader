import React from "react";

import { Appbar } from "react-native-paper";

import { useSelector } from "react-redux";

export const CustomAppbar = ({ title, onBackAction }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
            {onBackAction && <Appbar.BackAction onPress={onBackAction} />}
            <Appbar.Content
                title={title}
                titleStyle={{ color: theme.textColorPrimaryDark }}
            />
        </Appbar.Header>
    );
};

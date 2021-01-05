import React from "react";
import { Appbar } from "react-native-paper";
import { theme } from "../theme/theme";

export const CustomAppbar = ({ title, onBackAction }) => (
    <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
        {onBackAction && <Appbar.BackAction onPress={onBackAction} />}
        <Appbar.Content
            title={title}
            titleStyle={{ color: theme.textColorPrimaryDark }}
        />
    </Appbar.Header>
);

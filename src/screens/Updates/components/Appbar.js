import React from "react";
import { Appbar as MaterialAppbar } from "react-native-paper";

import { useSelector } from "react-redux";
import { updateAllNovels } from "../../../services/updates";

export const Appbar = () => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <MaterialAppbar.Header style={{ backgroundColor: theme.colorPrimary }}>
            <MaterialAppbar.Content
                title="Updates"
                titleStyle={{ color: theme.textColorPrimary }}
            />
            <MaterialAppbar.Action icon="reload" onPress={updateAllNovels} />
        </MaterialAppbar.Header>
    );
};

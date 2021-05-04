import React from "react";
import { Appbar as MaterialAppbar } from "react-native-paper";

import { useDispatch } from "react-redux";
import { updateLibraryAction } from "../../../redux/updates/updates.actions";

export const Appbar = ({ theme }) => {
    const dispatch = useDispatch();

    return (
        <MaterialAppbar.Header style={{ backgroundColor: theme.colorPrimary }}>
            <MaterialAppbar.Content
                title="Updates"
                titleStyle={{ color: theme.textColorPrimary }}
            />
            <MaterialAppbar.Action
                icon="reload"
                onPress={() => dispatch(updateLibraryAction())}
            />
        </MaterialAppbar.Header>
    );
};

import React from "react";
import { useDispatch } from "react-redux";

import { Appbar } from "../../Components/Appbar";
import { ScreenContainer } from "../../Components/Common";

import { useTheme } from "../../Hooks/reduxHooks";

const ReaderSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    return (
        <ScreenContainer theme={theme}>
            <Appbar title="Reader" onBackAction={() => navigation.goBack()} />
        </ScreenContainer>
    );
};

export default ReaderSettings;

import React from "react";
import { useDispatch } from "react-redux";

import { Appbar } from "../../Components/Appbar";
import { ScreenContainer } from "../../Components/Common";
import { ListItem, ListSection, ListSubHeader } from "../../Components/List";

import { useTheme } from "../../Hooks/reduxHooks";

import { clearAllHistoryAction } from "../../redux/history/history.actions";
import { deleteNovelCache } from "../../Database/queries/NovelQueries";

const AdvancedSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    return (
        <ScreenContainer theme={theme}>
            <Appbar title="General" onBackAction={() => navigation.goBack()} />
            <ListSection>
                <ListSubHeader theme={theme}>Data</ListSubHeader>
                <ListItem
                    title="Clear database"
                    description="Delete history for novels not in your library"
                    onPress={deleteNovelCache}
                    theme={theme}
                />
                <ListItem
                    title="Clear history"
                    description="Delete reading history for all novels"
                    onPress={() => dispatch(clearAllHistoryAction())}
                    theme={theme}
                />
            </ListSection>
        </ScreenContainer>
    );
};

export default AdvancedSettings;

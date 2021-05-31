import React, { useState } from "react";
import { View } from "react-native";
import { connect, useDispatch } from "react-redux";

import { setAppTheme } from "../../redux/settings/settings.actions";
import {
    setAppSettings,
    setItemsPerRow,
} from "../../redux/settings/settings.actions";
import { deleteNovelCache } from "../../Database/queries/NovelQueries";

import { Appbar } from "../../Components/Appbar";
import {
    Divider,
    ListItem,
    ListSection,
    ListSubHeader,
} from "../../Components/List";
import { useTheme } from "../../Hooks/reduxHooks";
import { clearAllHistoryAction } from "../../redux/history/history.actions";

const SettingsScreen = ({ navigation }) => {
    const theme = useTheme();

    const dispatch = useDispatch();

    return (
        <>
            <Appbar title="Settings" onBackAction={() => navigation.goBack()} />
            <View
                style={{
                    flex: 1,
                    backgroundColor: theme.colorPrimaryDark,
                }}
            >
                <ListItem
                    title="General"
                    icon="tune"
                    onPress={() =>
                        navigation.navigate("SettingsStack", {
                            screen: "GeneralSettings",
                        })
                    }
                    theme={theme}
                />
                {/* <ListItem
                    title="Reader"
                    icon="book-open-outline"
                    onPress={() =>
                        navigation.navigate("SettingsStack", {
                            screen: "ReaderSettings",
                        })
                    }
                    theme={theme}
                /> */}
                <ListItem
                    title="Tracking"
                    icon="sync"
                    onPress={() =>
                        navigation.navigate("SettingsStack", {
                            screen: "TrackerSettings",
                        })
                    }
                    theme={theme}
                />
                <ListItem
                    title="Backup"
                    icon="cloud-upload-outline"
                    onPress={() =>
                        navigation.navigate("SettingsStack", {
                            screen: "BackupSettings",
                        })
                    }
                    theme={theme}
                />
                <ListItem
                    title="Advanced"
                    icon="code-tags"
                    onPress={() =>
                        navigation.navigate("SettingsStack", {
                            screen: "AdvancedSettings",
                        })
                    }
                    theme={theme}
                />
            </View>
        </>
    );
};

export default SettingsScreen;

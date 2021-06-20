import React from "react";
import { View } from "react-native";

import { Appbar } from "../../components/Appbar";
import { ListItem } from "../../components/List";

import { useTheme } from "../../hooks/reduxHooks";

const SettingsScreen = ({ navigation }) => {
    const theme = useTheme();

    return (
        <>
            <Appbar title="Settings" onBackAction={navigation.goBack} />
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
                <ListItem
                    title="Reader"
                    icon="book-open-outline"
                    onPress={() =>
                        navigation.navigate("SettingsStack", {
                            screen: "ReaderSettings",
                        })
                    }
                    theme={theme}
                />
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

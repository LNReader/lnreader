import React from "react";

import { StyleSheet } from "react-native";
import { List } from "react-native-paper";

import { Appbar } from "../../components/common/Appbar";

import { useSelector } from "react-redux";

const MoreScreen = ({ navigation }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <>
            <Appbar title="More" />
            <List.Section
                style={{
                    flex: 1,
                    backgroundColor: theme.colorDarkPrimaryDark,
                    marginTop: 0,
                    marginBottom: 0,
                }}
            >
                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    title="Settings"
                    left={() => (
                        <List.Icon
                            color={theme.colorAccentDark}
                            icon="cog-outline"
                        />
                    )}
                    onPress={() => navigation.navigate("Settings")}
                />
                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    title="About"
                    left={() => (
                        <List.Icon
                            color={theme.colorAccentDark}
                            icon="information-outline"
                        />
                    )}
                    onPress={() => navigation.navigate("About")}
                />
            </List.Section>
        </>
    );
};

export default MoreScreen;

const styles = StyleSheet.create({});

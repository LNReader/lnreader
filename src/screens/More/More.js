import React from "react";
import { StyleSheet } from "react-native";
import { List } from "react-native-paper";
import { CustomAppbar } from "../../components/Appbar";
import { theme } from "../../theming/theme";

const MoreScreen = ({ navigation }) => {
    return (
        <>
            <CustomAppbar title="More" />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
    },
});

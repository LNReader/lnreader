import React from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

import { Appbar } from "../../components/Appbar";
import { ListItem, ListSection } from "../../components/List";

const MoreScreen = ({ navigation }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <>
            <Appbar title="More" />
            <View style={{ flex: 1, backgroundColor: theme.colorPrimaryDark }}>
                <ListSection>
                    <ListItem
                        title="Settings"
                        icon="cog-outline"
                        onPress={() =>
                            navigation.navigate("SettingsStack", {
                                screen: "Settings",
                            })
                        }
                        theme={theme}
                    />
                    <ListItem
                        title="About"
                        icon="information-outline"
                        onPress={() =>
                            navigation.navigate("SettingsStack", {
                                screen: "About",
                            })
                        }
                        theme={theme}
                    />
                </ListSection>
            </View>
        </>
    );
};

export default MoreScreen;

const styles = StyleSheet.create({});

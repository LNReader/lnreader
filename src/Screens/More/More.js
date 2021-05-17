import React from "react";
import { StyleSheet, View, Image } from "react-native";

import { Appbar } from "../../Components/Appbar";
import { ListItem, ListSection } from "../../Components/List";

import { useTheme } from "../../Hooks/reduxHooks";

const MoreScreen = ({ navigation }) => {
    const theme = useTheme();

    return (
        <>
            <Appbar title="More" style={{ elevation: 0 }} />
            <View style={{ flex: 1, backgroundColor: theme.colorPrimaryDark }}>
                <View style={{ overflow: "hidden", paddingBottom: 4 }}>
                    <View
                        style={{
                            paddingTop: 10,
                            paddingBottom: 25,
                            alignItems: "center",
                            backgroundColor: theme.colorPrimary,
                            elevation: 4,
                        }}
                    >
                        <Image
                            source={require("../../../assets/logo.png")}
                            style={{
                                height: 80,
                                width: 80,
                                tintColor: theme.textColorPrimary,
                            }}
                        />
                    </View>
                </View>
                <ListSection>
                    <ListItem
                        title="Settings"
                        icon="cog-outline"
                        onPress={() =>
                            navigation.navigate("MoreStack", {
                                screen: "SettingsStack",
                            })
                        }
                        theme={theme}
                    />

                    <ListItem
                        title="About"
                        icon="information-outline"
                        onPress={() =>
                            navigation.navigate("MoreStack", {
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

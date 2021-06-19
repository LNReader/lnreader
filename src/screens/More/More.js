import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { useSelector } from "react-redux";

import { Appbar } from "../../components/Appbar";
import { Divider, ListItem, ListSection } from "../../components/List";

import { useTheme } from "../../hooks/reduxHooks";

const MoreScreen = ({ navigation }) => {
    const theme = useTheme();
    const { downloadQueue } = useSelector((state) => state.downloadsReducer);

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
                        title="Download queue"
                        description={
                            downloadQueue.length > 0 &&
                            downloadQueue.length + " remaining"
                        }
                        icon="download-outline"
                        onPress={() =>
                            navigation.navigate("MoreStack", {
                                screen: "DownloadQueue",
                            })
                        }
                        theme={theme}
                    />
                    <Divider theme={theme} />
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

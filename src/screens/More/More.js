import React from "react";
import { StyleSheet, View, Image, Pressable, Text } from "react-native";
import { List, Switch } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { Appbar } from "../../components/Appbar";
import { Divider, ListItem, ListSection } from "../../components/List";

import { useSettings, useTheme } from "../../hooks/reduxHooks";
import { setAppSettings } from "../../redux/settings/settings.actions";

const MoreScreen = ({ navigation }) => {
    const theme = useTheme();
    const { downloadQueue } = useSelector((state) => state.downloadsReducer);
    const { incognitoMode } = useSettings();
    const dispatch = useDispatch();

    const enableIncognitoMode = () => {
        dispatch(setAppSettings("incognitoMode", !incognitoMode));
    };

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
                    <Pressable
                        android_ripple={{ color: theme.rippleColor }}
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                        onPress={enableIncognitoMode}
                    >
                        <View style={{ flexDirection: "row" }}>
                            <List.Icon
                                color={theme.colorAccent}
                                icon="incognito"
                                style={{ margin: 0 }}
                            />
                            <View style={{ marginLeft: 16 }}>
                                <Text
                                    style={{
                                        color: theme.textColorPrimary,
                                        fontSize: 16,
                                    }}
                                >
                                    Incognito Mode
                                </Text>
                                <Text
                                    style={{ color: theme.textColorSecondary }}
                                >
                                    Pauses reading history
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={incognitoMode}
                            onValueChange={enableIncognitoMode}
                            color={theme.colorAccent}
                            style={{ marginRight: 8 }}
                        />
                    </Pressable>

                    <ListItem
                        title="Download queue"
                        description={
                            downloadQueue.length > 0 &&
                            downloadQueue.length + " remaining"
                        }
                        icon="progress-download"
                        onPress={() =>
                            navigation.navigate("MoreStack", {
                                screen: "DownloadQueue",
                            })
                        }
                        theme={theme}
                    />
                    <ListItem
                        title="Downloads"
                        icon="folder-download"
                        onPress={() =>
                            navigation.navigate("MoreStack", {
                                screen: "Downloads",
                            })
                        }
                        theme={theme}
                    />

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

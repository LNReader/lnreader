import React from "react";
import { View } from "react-native";
import * as Linking from "expo-linking";

import { Appbar } from "../../components/Appbar";

import { useSelector } from "react-redux";
import { Divider, ListItem, ListSection } from "../../components/List";

const AboutScreen = ({ navigation }) => {
    const theme = useSelector((state) => state.settingsReducer.theme);

    return (
        <>
            <Appbar title="About" onBackAction={() => navigation.goBack()} />
            <View style={{ flex: 1, backgroundColor: theme.colorPrimaryDark }}>
                <ListSection>
                    <ListItem
                        title="Version"
                        description="Stable 1.1.2"
                        theme={theme}
                    />
                    <ListItem
                        title="Build Time"
                        description="17-07-21 08:00 AM"
                        theme={theme}
                    />
                    <ListItem
                        title="What's new"
                        onPress={() =>
                            Linking.openURL(
                                "https://github.com/LNReader/lnreader/commits/main"
                            )
                        }
                        theme={theme}
                    />
                    <Divider theme={theme} />
                    <ListItem
                        title="Discord"
                        description="https://discord.gg/QdcWN4MD63"
                        onPress={() =>
                            Linking.openURL("https://discord.gg/QdcWN4MD63")
                        }
                        theme={theme}
                    />
                    <ListItem
                        title="Github"
                        description="https://github.com/LNReader/lnreader"
                        onPress={() =>
                            Linking.openURL(
                                "https://github.com/LNReader/lnreader"
                            )
                        }
                        theme={theme}
                    />
                    <ListItem
                        title="Sources"
                        description="https://github.com/LNReader/lnreader-sources"
                        onPress={() =>
                            Linking.openURL(
                                "https://github.com/LNReader/lnreader-sources"
                            )
                        }
                        theme={theme}
                    />
                </ListSection>
            </View>
        </>
    );
};

export default AboutScreen;

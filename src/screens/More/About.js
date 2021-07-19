import React from "react";
import { View } from "react-native";
import * as Linking from "expo-linking";

import { Appbar } from "../../components/Appbar";

import { useSelector } from "react-redux";
import { List } from "../../components/List";
import { ScreenContainer } from "../../components/Common";
import { MoreHeader } from "./components/MoreHeader";
import { IconButton } from "react-native-paper";

const AboutScreen = ({ navigation }) => {
    const theme = useSelector((state) => state.settingsReducer.theme);

    return (
        <ScreenContainer theme={theme}>
            <MoreHeader title="About" navigation={navigation} theme={theme} />
            <List.Section>
                <List.Item
                    title="Version"
                    description="Stable 1.1.2 (17/07/21 08:00 AM)"
                    theme={theme}
                />
                <List.Item
                    title="What's new"
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/LNReader/lnreader/releases/tag/v1.1.2"
                        )
                    }
                    theme={theme}
                />
                <List.Divider theme={theme} />
                <List.Item
                    title="Discord"
                    description="https://discord.gg/QdcWN4MD63"
                    onPress={() =>
                        Linking.openURL("https://discord.gg/QdcWN4MD63")
                    }
                    theme={theme}
                />
                <List.Item
                    title="Github"
                    description="https://github.com/LNReader/lnreader"
                    onPress={() =>
                        Linking.openURL("https://github.com/LNReader/lnreader")
                    }
                    theme={theme}
                />
                <List.Item
                    title="Sources"
                    description="https://github.com/LNReader/lnreader-sources"
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/LNReader/lnreader-sources"
                        )
                    }
                    theme={theme}
                />
            </List.Section>
        </ScreenContainer>
    );
};

export default AboutScreen;

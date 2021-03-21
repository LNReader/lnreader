import React from "react";
import * as Linking from "expo-linking";
import { List, Divider } from "react-native-paper";

import { Appbar } from "../../components/common/Appbar";

import { useSelector } from "react-redux";

const AboutScreen = ({ navigation }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <>
            <Appbar title="About" onBackAction={() => navigation.goBack()} />
            <List.Section
                style={{
                    flex: 1,
                    marginTop: 0,
                    backgroundColor: theme.colorPrimaryDark,
                    marginBottom: 0,
                }}
            >
                <List.Item
                    titleStyle={{ color: theme.textColorPrimary }}
                    title="Version"
                    descriptionStyle={{ color: theme.textColorSecondary }}
                    description="Stable 1.0.5"
                />
                <List.Item
                    titleStyle={{ color: theme.textColorPrimary }}
                    title="Build Time"
                    descriptionStyle={{ color: theme.textColorSecondary }}
                    description="21-03-21 11:10 AM"
                />

                <List.Item
                    titleStyle={{ color: theme.textColorPrimary }}
                    title="What's new"
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/rajarsheechatterjee/lnreader/commits/main"
                        )
                    }
                    rippleColor={theme.rippleColor}
                />
                <Divider />

                <List.Item
                    titleStyle={{ color: theme.textColorPrimary }}
                    descriptionStyle={{ color: theme.textColorSecondary }}
                    title="Github"
                    description="https://github.com/rajarsheechatterjee/lnreader"
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/rajarsheechatterjee/lnreader"
                        )
                    }
                    rippleColor={theme.rippleColor}
                />
                <List.Item
                    titleStyle={{ color: theme.textColorPrimary }}
                    descriptionStyle={{ color: theme.textColorSecondary }}
                    title="Extensions"
                    description="https://github.com/rajarsheechatterjee/lnreader-extensions"
                    descriptionNumberOfLines={1}
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/rajarsheechatterjee/lnreader-extensions"
                        )
                    }
                    rippleColor={theme.rippleColor}
                />
            </List.Section>
        </>
    );
};

export default AboutScreen;

import React from "react";
import * as Linking from "expo-linking";
import { List, Divider } from "react-native-paper";

import { CustomAppbar } from "../../components/common/Appbar";

import { useSelector } from "react-redux";

const AboutScreen = ({ navigation }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <>
            <CustomAppbar
                title="About"
                onBackAction={() => navigation.goBack()}
            />
            <List.Section
                style={{
                    flex: 1,
                    marginTop: 0,
                    backgroundColor: theme.colorDarkPrimaryDark,
                    marginBottom: 0,
                }}
            >
                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    title="Version"
                    descriptionStyle={{ color: theme.textColorSecondaryDark }}
                    description="Stable 1.0.17"
                />
                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    title="Build Time"
                    descriptionStyle={{ color: theme.textColorSecondaryDark }}
                    description="09-03-21  09:46 AM"
                />

                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    title="What's new"
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/rajarsheechatterjee/lnreader/commits/master"
                        )
                    }
                    rippleColor={theme.rippleColorDark}
                />
                <Divider />

                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    descriptionStyle={{ color: theme.textColorSecondaryDark }}
                    title="Github"
                    description="https://github.com/rajarsheechatterjee/lnreader"
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/rajarsheechatterjee/lnreader"
                        )
                    }
                    rippleColor={theme.rippleColorDark}
                />
                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    descriptionStyle={{ color: theme.textColorSecondaryDark }}
                    title="Extensions"
                    description="https://github.com/rajarsheechatterjee/lnreader-extensions"
                    descriptionNumberOfLines={1}
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/rajarsheechatterjee/lnreader-extensions"
                        )
                    }
                    rippleColor={theme.rippleColorDark}
                />
            </List.Section>
        </>
    );
};

export default AboutScreen;

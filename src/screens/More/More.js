import React from "react";

import { StyleSheet } from "react-native";
import { List } from "react-native-paper";

import { CustomAppbar } from "../../components/common/Appbar";

import { connect } from "react-redux";

const MoreScreen = ({ navigation, theme }) => {
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

const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
});

export default connect(mapStateToProps)(MoreScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
    },
});

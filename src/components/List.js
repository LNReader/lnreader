import React from "react";
import { StyleSheet } from "react-native";
import { List, Divider as PaperDivider } from "react-native-paper";

const ListSection = ({ children }) => (
    <List.Section style={styles.listSection}>{children}</List.Section>
);

const ListSubHeader = ({ children, theme }) => (
    <List.Subheader
        style={[styles.listSubHeader, { color: theme.colorAccentDark }]}
    >
        {children}
    </List.Subheader>
);

const ListItem = ({ title, description, icon, onPress, theme }) => (
    <List.Item
        title={title}
        titleStyle={{ color: theme.textColorPrimary }}
        description={description}
        descriptionStyle={{ color: theme.textColorSecondary }}
        descriptionNumberOfLines={1}
        left={() =>
            icon && (
                <List.Icon
                    color={theme.colorAccentDark}
                    icon={icon}
                    style={{ marginVertical: 0 }}
                />
            )
        }
        onPress={onPress}
        rippleColor={theme.rippleColor}
    />
);

const Divider = ({ theme }) => (
    <PaperDivider
        style={{
            backgroundColor: theme.dividerColor,
            height: 1,
        }}
    />
);

export { ListSection, ListSubHeader, ListItem, Divider };

const styles = StyleSheet.create({
    listSection: {
        flex: 1,
        marginVertical: 0,
    },
    listSubHeader: {
        paddingBottom: 5,
    },
});

import React from "react";
import { StyleSheet, View } from "react-native";

import { List, Divider as PaperDivider } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ListSection = ({ children }) => (
    <List.Section style={styles.listSection}>{children}</List.Section>
);

const ListSubHeader = ({ children, theme }) => (
    <List.Subheader
        style={[styles.listSubHeader, { color: theme.colorAccent }]}
    >
        {children}
    </List.Subheader>
);

const ListItem = ({
    title,
    description,
    icon,
    onPress,
    theme,
    right,
    iconColor,
    titleStyle,
    style,
}) => (
    <List.Item
        title={title}
        style={style}
        titleStyle={[{ color: theme.textColorPrimary }, titleStyle]}
        description={description}
        descriptionStyle={{ color: theme.textColorSecondary }}
        descriptionNumberOfLines={1}
        left={() => (
            <View style={{ justifyContent: "center" }}>
                {icon && (
                    <List.Icon
                        color={theme.colorAccent}
                        icon={icon}
                        style={{
                            marginVertical: 0,
                        }}
                    />
                )}
            </View>
        )}
        right={() =>
            right && (
                <MaterialCommunityIcons
                    name={right}
                    color={iconColor || "#47a84a"}
                    size={23}
                    style={{ marginRight: 16, textAlignVertical: "center" }}
                />
            )
        }
        onPress={onPress}
        rippleColor={theme.rippleColor}
    />
);

const Divider = ({ theme }) => (
    <PaperDivider style={{ backgroundColor: theme.dividerColor, height: 1 }} />
);

const InfoItem = ({ title, icon, theme }) => (
    <List.Item
        title={title}
        titleStyle={{ color: theme.textColorSecondary, fontSize: 14 }}
        titleNumberOfLines={5}
        left={() =>
            icon && (
                <List.Icon
                    color={theme.textColorSecondary}
                    icon={icon}
                    style={{ marginVertical: 0 }}
                />
            )
        }
    />
);

export { ListSection, ListSubHeader, ListItem, Divider, InfoItem };

const styles = StyleSheet.create({
    listSection: {
        flex: 1,
        marginVertical: 0,
    },
    listSubHeader: {
        paddingBottom: 5,
    },
});

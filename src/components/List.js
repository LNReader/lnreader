import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import color from 'color';

import { List as PaperList, Divider as PaperDivider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ListSection = ({ children }) => (
  <PaperList.Section style={styles.listSection}>{children}</PaperList.Section>
);

const ListSubHeader = ({ children, theme }) => (
  <PaperList.Subheader style={[styles.listSubHeader, { color: theme.primary }]}>
    {children}
  </PaperList.Subheader>
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
  <PaperList.Item
    title={title}
    style={[{ paddingHorizontal: 16, paddingVertical: 12 }, style]}
    titleStyle={[{ color: theme.textColorPrimary }, titleStyle]}
    description={description}
    descriptionStyle={{ color: theme.textColorSecondary }}
    descriptionNumberOfLines={1}
    left={
      icon
        ? () => (
            <View style={{ justifyContent: 'center' }}>
              <PaperList.Icon
                color={theme.primary}
                icon={icon}
                style={{
                  marginVertical: 0,
                }}
              />
            </View>
          )
        : undefined
    }
    right={() =>
      right && (
        <MaterialCommunityIcons
          name={right}
          color={iconColor || '#47a84a'}
          size={23}
          style={{ marginRight: 16, textAlignVertical: 'center' }}
        />
      )
    }
    onPress={onPress}
    rippleColor={color(theme.primary).alpha(0.12).string()}
  />
);

const Divider = ({ theme }) => (
  <PaperDivider
    style={{
      backgroundColor: color(theme.isDark ? '#FFFFFF' : '#000000')
        .alpha(0.12)
        .rgb()
        .string(),
      height: 1,
    }}
  />
);

const InfoItem = ({ title, icon, theme }) => (
  <PaperList.Item
    title={title}
    titleStyle={{ color: theme.textColorSecondary, fontSize: 14 }}
    titleNumberOfLines={5}
    left={() =>
      icon && <PaperList.Icon color={theme.textColorSecondary} icon={icon} />
    }
  />
);

const ColorItem = ({ title, description, theme, onPress }) => (
  <Pressable
    style={{
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
    android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
    onPress={onPress}
  >
    <View>
      <Text style={{ color: theme.textColorPrimary, fontSize: 16 }}>
        {title}
      </Text>
      <Text style={{ color: theme.textColorSecondary }}>{description}</Text>
    </View>
    <View
      style={{
        backgroundColor: description,
        height: 24,
        width: 24,
        borderRadius: 50,
        marginRight: 16,
      }}
    />
  </Pressable>
);

const Icon = ({ icon, theme }) => (
  <PaperList.Icon color={theme.primary} icon={icon} style={{ margin: 0 }} />
);

export const List = {
  Section: ListSection,
  SubHeader: ListSubHeader,
  Item: ListItem,
  Divider,
  InfoItem,
  ColorItem,
  Icon,
};

const styles = StyleSheet.create({
  listSection: {
    flex: 1,
    marginVertical: 0,
  },
  listSubHeader: {
    fontWeight: 'bold',
    paddingBottom: 5,
  },
});

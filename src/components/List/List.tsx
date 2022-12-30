import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import color from 'color';

import { List as PaperList, Divider as PaperDivider } from 'react-native-paper';
import { MD3ThemeType } from '../../theme/types';
import { dividerColor } from '../../theme/colors';

interface ListItemProps {
  title: string;
  description?: string | null;
  icon?: string;
  onPress?: () => void;
  theme: MD3ThemeType;
}

const Section = ({ children }: { children: ReactNode }) => (
  <PaperList.Section style={styles.listSection}>{children}</PaperList.Section>
);

const SubHeader = ({
  children,
  theme,
}: {
  children: ReactNode;
  theme: MD3ThemeType;
}) => (
  <PaperList.Subheader style={{ color: theme.primary }}>
    {children}
  </PaperList.Subheader>
);

const Item: React.FC<ListItemProps> = ({
  title,
  description,
  icon,
  onPress,
  theme,
}) => (
  <PaperList.Item
    title={title}
    titleStyle={{ color: theme.textColorPrimary }}
    description={description}
    descriptionStyle={{ color: theme.textColorSecondary }}
    left={() => (
      <View style={styles.iconContainer}>
        {icon && (
          <PaperList.Icon
            color={theme.primary}
            icon={icon}
            style={styles.icon}
          />
        )}
      </View>
    )}
    onPress={onPress}
    rippleColor={color(theme.primary).alpha(0.12).string()}
  />
);

const Divider = ({ theme }: { theme: MD3ThemeType }) => (
  <PaperDivider
    style={[styles.divider, { backgroundColor: dividerColor(theme.isDark) }]}
  />
);

const InfoItem = ({
  title,
  icon,
  theme,
}: {
  title: string;
  icon: string;
  theme: MD3ThemeType;
}) => (
  <PaperList.Item
    title={title}
    style={{ paddingHorizontal: 16 }}
    titleStyle={[{ color: theme.textColorSecondary }, styles.infoItem]}
    titleNumberOfLines={5}
    left={() =>
      icon && <PaperList.Icon color={theme.textColorSecondary} icon={icon} />
    }
  />
);

export default {
  Section,
  SubHeader,
  Item,
  Divider,
  InfoItem,
};

const styles = StyleSheet.create({
  listSection: {
    flex: 1,
    marginVertical: 0,
  },
  divider: {
    height: 1,
  },
  iconContainer: {
    justifyContent: 'center',
  },
  icon: {
    marginVertical: 0,
  },
  infoItem: {
    fontSize: 14,
  },
});

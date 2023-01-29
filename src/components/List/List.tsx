import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import color from 'color';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  icon = 'information-outline',
  theme,
}: {
  title: string;
  icon: string;
  theme: MD3ThemeType;
}) => (
  <View style={styles.infoCtn}>
    <MaterialIcon size={20} color={theme.onSurfaceVariant} name={icon} />
    <Text style={[styles.infoMsg, { color: theme.onSurfaceVariant }]}>
      {title}
    </Text>
  </View>
);

const Icon = ({ icon, theme }: { icon: string; theme: MD3ThemeType }) => (
  <PaperList.Icon color={theme.primary} icon={icon} style={{ margin: 0 }} />
);

export default {
  Section,
  SubHeader,
  Item,
  Divider,
  InfoItem,
  Icon,
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
  infoCtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoMsg: {
    marginTop: 12,
    fontSize: 12,
  },
});

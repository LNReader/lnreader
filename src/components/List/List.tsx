import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { List as PaperList, Divider as PaperDivider } from 'react-native-paper';
import { ThemeTypeV1 } from '../../theme/v1/theme/types';

interface ListItemProps {
  title: string;
  description?: string | null;
  icon?: string;
  onPress?: () => void;
  theme: ThemeTypeV1;
}

const Section = ({ children }: { children: ReactNode }) => (
  <PaperList.Section style={styles.listSection}>{children}</PaperList.Section>
);

const SubHeader = ({
  children,
  theme,
}: {
  children: ReactNode;
  theme: ThemeTypeV1;
}) => (
  <PaperList.Subheader style={{ color: theme.colorAccent }}>
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
            color={theme.colorAccent}
            icon={icon}
            style={styles.icon}
          />
        )}
      </View>
    )}
    onPress={onPress}
    rippleColor={theme.rippleColor}
  />
);

const Divider = ({ theme }: { theme: ThemeTypeV1 }) => (
  <PaperDivider
    style={[styles.divider, { backgroundColor: theme.dividerColor }]}
  />
);

const InfoItem = ({
  title,
  icon,
  theme,
}: {
  title: string;
  icon: string;
  theme: ThemeTypeV1;
}) => (
  <PaperList.Item
    title={title}
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

import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import {List as PaperList, Divider as PaperDivider} from 'react-native-paper';
import {ThemeType} from '../../theme/types';

interface ListItemProps {
  title: string;
  description?: string | null;
  icon?: string;
  onPress?: () => void;
  theme: ThemeType;
}

const Section = ({children}: {children: ReactNode}) => (
  <PaperList.Section style={styles.listSection}>{children}</PaperList.Section>
);

const SubHeader = ({
  children,
  theme,
}: {
  children: ReactNode;
  theme: ThemeType;
}) => (
  <PaperList.Subheader style={{color: theme.primary}}>
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
    titleStyle={{color: theme.textColorPrimary}}
    description={description}
    descriptionStyle={{color: theme.textColorSecondary}}
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
    rippleColor={theme.rippleColor}
  />
);

const Divider = ({theme}: {theme: ThemeType}) => (
  <PaperDivider style={[styles.divider, {backgroundColor: theme.divider}]} />
);

export default {
  Section,
  SubHeader,
  Item,
  Divider,
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
});

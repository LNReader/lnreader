import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { ThemeColors } from '../../theme/types';
import { Button } from 'react-native-paper';

interface EmptyViewProps {
  icon?: string;
  description: string;
  theme: ThemeColors;
  actions?: Array<{
    iconName: string;
    title: string;
    onPress: () => void;
  }>;
}

const EmptyView: React.FC<EmptyViewProps> = ({
  icon,
  description,
  theme,
  actions,
}) => (
  <View style={styles.container}>
    {icon ? (
      <Text style={[styles.icon, { color: theme.outline }]}>{icon}</Text>
    ) : null}
    <Text style={[styles.text, { color: theme.outline }]}>{description}</Text>
    {actions?.length ? (
      <View style={styles.actionsCtn}>
        {actions.map(action => (
          <View key={action.title} style={styles.buttonWrapper}>
            <Button
              rippleColor={theme.rippleColor}
              onPress={action.onPress}
              icon={action.iconName}
              textColor={theme.outline}
              mode="outlined"
            >
              {action.title}
            </Button>
          </View>
        ))}
      </View>
    ) : null}
  </View>
);

export default EmptyView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  text: {
    marginTop: 16,
  },
  buttonWrapper: {
    marginHorizontal: 4,
    flexDirection: 'row',
  },
  actionsCtn: {
    marginTop: 20,
    flexDirection: 'row',
  },
});

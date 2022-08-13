import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { ThemeType } from '../../theme/types';

interface EmptyViewProps {
  icon?: string;
  description: string;
  theme: ThemeType;
}

const EmptyView: React.FC<EmptyViewProps> = ({ icon, description, theme }) => (
  <View style={styles.container}>
    {icon ? (
      <Text style={[styles.icon, { color: theme.textColorHint }]}>{icon}</Text>
    ) : null}
    <Text style={[styles.text, { color: theme.textColorHint }]}>
      {description}
    </Text>
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
});

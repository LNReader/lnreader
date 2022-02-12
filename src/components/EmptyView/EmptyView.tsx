import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

import {Theme} from '../../theme/types';

interface EmptyViewProps {
  icon: string;
  description: string;
  theme: Theme;
}

const EmptyView: React.FC<EmptyViewProps> = ({icon, description, theme}) => (
  <View style={styles.container}>
    <Text style={[styles.icon, {color: theme.textColorHint}]}>{icon}</Text>
    <Text style={[styles.text, {color: theme.textColorHint}]}>
      {description}
    </Text>
  </View>
);

export default EmptyView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

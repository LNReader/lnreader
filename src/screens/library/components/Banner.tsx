import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeColors } from '../../../theme/types';

interface Props {
  label: string;
  icon?: string;
  backgroundColor?: string;
  textColor?: string;
  theme: ThemeColors;
}

export const Banner: React.FC<Props> = ({
  label,
  icon,
  theme,
  backgroundColor = theme.primary,
  textColor = theme.onPrimary,
}) => (
  <View style={[{ backgroundColor }, styles.container]}>
    {icon ? (
      <MaterialCommunityIcons
        name={icon}
        color={textColor}
        size={18}
        style={styles.icon}
      />
    ) : null}
    <Text style={[{ color: textColor }, styles.bannerText]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  bannerText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

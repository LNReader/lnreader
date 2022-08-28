import { useTheme } from '@hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const EmptyView = ({ icon, description, style, children, iconStyle }) => {
  const theme = useTheme();

  return (
    <View style={styles.emptyViewContainer}>
      <Text
        style={[
          styles.emptyViewIcon,
          { color: theme.textColorHint },
          style,
          iconStyle,
        ]}
      >
        {icon}
      </Text>
      <Text
        style={[styles.emptyViewText, { color: theme.textColorHint }, style]}
      >
        {description}
      </Text>
      {children}
    </View>
  );
};

export default EmptyView;

const styles = StyleSheet.create({
  emptyViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyViewIcon: {
    fontSize: 45,
  },
  emptyViewText: {
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

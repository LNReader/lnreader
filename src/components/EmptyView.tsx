import { useTheme } from '@hooks/persisted';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyViewProps {
  icon: string;
  description: string;
  style?: any;
  children?: React.ReactNode;
  iconStyle?: any;
}

const EmptyView = ({
  icon,
  description,
  style,
  children,
  iconStyle,
}: EmptyViewProps) => {
  const theme = useTheme();

  return (
    <View style={styles.emptyViewContainer}>
      <Text
        style={[
          styles.emptyViewIcon,
          { color: theme.outline },
          style,
          iconStyle,
        ]}
      >
        {icon}
      </Text>
      <Text style={[styles.emptyViewText, { color: theme.outline }, style]}>
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

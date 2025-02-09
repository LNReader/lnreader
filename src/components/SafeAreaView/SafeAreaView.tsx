import React, { memo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaViewProps {
  children: React.ReactNode;
  excludeTop?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  style,
  excludeTop,
}) => {
  const { bottom, top, right, left } = useSafeAreaInsets();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    padding: {
      paddingBottom: bottom,
      paddingTop: excludeTop ? 0 : top,
      paddingRight: right,
      paddingLeft: left,
    },
  });
  return (
    <View style={[styles.container, styles.padding, style]}>{children}</View>
  );
};

export default memo(SafeAreaView);

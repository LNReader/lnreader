import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
}

const Container: React.FC<Props> = ({ children }) => {
  const { bottom } = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    {
      paddingBottom: bottom,
    },
  ];

  return <View style={containerStyle}>{children}</View>;
};

export default Container;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

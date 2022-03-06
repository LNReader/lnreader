import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface ReaderThemeToggleButtonProps {
  selected: boolean;
  readerTheme: {
    backgroundColor: string;
    textColor: string;
  };
  onPress?: () => void;
}

const ReaderThemeToggleButton: React.FC<ReaderThemeToggleButtonProps> = ({
  selected,
  readerTheme,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        android_ripple={{ color: readerTheme.textColor }}
        style={[
          styles.pressable,
          {
            backgroundColor: readerTheme.backgroundColor,
          },
        ]}
        onPress={onPress}
      >
        <MaterialCommunityIcons
          name={selected ? 'check' : 'format-color-text'}
          color={readerTheme.textColor}
          size={24}
        />
      </Pressable>
    </View>
  );
};

export default ReaderThemeToggleButton;

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
    marginHorizontal: 6,
    height: 44,
    width: 44,
  },
  pressable: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

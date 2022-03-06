import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { ThemeType } from '../../../../theme/types';

interface ReaderFontToggleButtonProps {
  selected: boolean;
  readerFont: {
    fontFamily: string;
    name: string;
  };
  onPress: () => void;
  theme: ThemeType;
}

const ReaderFontToggleButton: React.FC<ReaderFontToggleButtonProps> = ({
  selected,
  readerFont,
  onPress,
  theme,
}) => (
  <View
    style={[
      styles.container,
      { backgroundColor: selected ? theme.rippleColor : theme.surfaceVariant },
    ]}
  >
    <Pressable
      style={styles.content}
      onPress={onPress}
      android_ripple={{ color: theme.rippleColor }}
    >
      <Text
        style={[
          styles.font,
          {
            fontFamily: readerFont.fontFamily,
            color: selected ? theme.primary : theme.textColorPrimary,
          },
        ]}
      >
        {readerFont.name}
      </Text>
    </Pressable>
  </View>
);

export default ReaderFontToggleButton;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  font: {
    // fontSize: 16,
  },
});

import { StyleSheet, Text, TextStyle, View } from 'react-native';
import React from 'react';

import { useChapterReaderSettings, useTheme } from '@hooks/persisted';
import { IconButtonV2 } from '@components';
import { getString } from '@strings/translations';

interface ReaderLineHeightProps {
  labelStyle?: TextStyle | TextStyle[];
}

const ReaderLineHeight: React.FC<ReaderLineHeightProps> = ({ labelStyle }) => {
  const theme = useTheme();

  const { lineHeight, setChapterReaderSettings } = useChapterReaderSettings();

  return (
    <View style={styles.container}>
      <Text style={[{ color: theme.onSurfaceVariant }, labelStyle]}>
        {getString('readerScreen.bottomSheet.lineHeight')}
      </Text>
      <View style={styles.buttonContainer}>
        <IconButtonV2
          name="minus"
          color={theme.primary}
          size={26}
          disabled={lineHeight <= 1.3}
          onPress={() =>
            setChapterReaderSettings({ lineHeight: lineHeight - 0.1 })
          }
          theme={theme}
        />
        <Text style={[styles.value, { color: theme.onSurface }]}>
          {`${Math.round(lineHeight * 10) / 10}%`}
        </Text>
        <IconButtonV2
          name="plus"
          color={theme.primary}
          size={26}
          disabled={lineHeight >= 2}
          onPress={() =>
            setChapterReaderSettings({ lineHeight: lineHeight + 0.1 })
          }
          theme={theme}
        />
      </View>
    </View>
  );
};

export default ReaderLineHeight;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  value: {
    paddingHorizontal: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

import { StyleSheet, Text, TextStyle, View } from 'react-native';
import React from 'react';

import { useAppDispatch, useReaderSettings } from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { IconButtonV2 } from '@components/index';
import { setReaderSettings } from '@redux/settings/settingsSliceV1';
import { getString } from '@strings/translations';

interface ReaderTextSizeProps {
  labelStyle?: TextStyle | TextStyle[];
}

const ReaderTextSize: React.FC<ReaderTextSizeProps> = ({ labelStyle }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { textSize } = useReaderSettings();

  return (
    <View style={styles.container}>
      <Text style={[{ color: theme.onSurfaceVariant }, labelStyle]}>
        {getString('readerScreen.bottomSheet.textSize')}
      </Text>
      <View style={styles.buttonContainer}>
        <IconButtonV2
          name="minus"
          color={theme.primary}
          size={26}
          disabled={textSize <= 0}
          onPress={() =>
            dispatch(
              setReaderSettings({ key: 'textSize', value: textSize - 1 }),
            )
          }
          theme={theme}
        />
        <Text style={[styles.value, { color: theme.onSurface }]}>
          {textSize}
        </Text>
        <IconButtonV2
          name="plus"
          color={theme.primary}
          size={26}
          onPress={() =>
            dispatch(
              setReaderSettings({ key: 'textSize', value: textSize + 1 }),
            )
          }
          theme={theme}
        />
      </View>
    </View>
  );
};

export default ReaderTextSize;

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

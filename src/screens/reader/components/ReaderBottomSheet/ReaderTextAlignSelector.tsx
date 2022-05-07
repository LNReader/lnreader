import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { setReaderSettings } from '../../../../redux/settings/settings.actions';
import {
  useAppDispatch,
  useReaderSettings,
  useTheme,
} from '../../../../redux/hooks';
import { textAlignments } from '../../../../utils/constants/readerConstants';
import { ToggleButton } from '../../../../components/Common/ToggleButton';
import { getString } from '../../../../../strings/translations';

const ReaderTextAlignSelector = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { textAlign } = useReaderSettings();

  return (
    <View style={styles.container}>
      <Text style={{ color: theme.textColorSecondary }}>
        {getString('readerScreen.bottomSheet.textAlign')}
      </Text>
      <View style={styles.buttonContainer}>
        {textAlignments.map(item => (
          <ToggleButton
            key={item.value}
            selected={item.value === textAlign}
            icon={item.icon}
            theme={theme}
            onPress={() => dispatch(setReaderSettings('textAlign', item.value))}
          />
        ))}
      </View>
    </View>
  );
};

export default ReaderTextAlignSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
});

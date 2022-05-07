import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import {
  useAppDispatch,
  useReaderSettings,
  useTheme,
} from '../../../../redux/hooks';
import Slider from '@react-native-community/slider';
import { setReaderSettings } from '../../../../redux/settings/settings.actions';
import { getString } from '../../../../../strings/translations';

const TRACK_TINT_COLOR = '#000000';

const TextSizeSlider: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { textSize } = useReaderSettings();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textColorSecondary }]}>
        {getString('readerScreen.bottomSheet.textSize')}
      </Text>
      <Slider
        style={styles.slider}
        value={textSize}
        minimumValue={12}
        maximumValue={20}
        step={1}
        minimumTrackTintColor={theme.colorAccent}
        maximumTrackTintColor={TRACK_TINT_COLOR}
        thumbTintColor={theme.colorAccent}
        onSlidingComplete={value =>
          dispatch(setReaderSettings('textSize', value))
        }
      />
    </View>
  );
};

export default TextSizeSlider;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
});

import { TextStyle } from 'react-native';
import React from 'react';

import { useAppDispatch, useReaderSettings } from '../../../../redux/hooks';
import { setReaderSettings } from '../../../../redux/settings/settings.actions';
import { getString } from '../../../../../strings/translations';
import Counter from '@components/Counter/Counter';

interface ReaderLineHeightProps {
  labelStyle?: TextStyle | TextStyle[];
}

const ReaderLineHeight: React.FC<ReaderLineHeightProps> = ({ labelStyle }) => {
  const dispatch = useAppDispatch();

  const { lineHeight } = useReaderSettings();
  return (
    <Counter
      labelStyle={labelStyle}
      label={getString('readerScreen.bottomSheet.lineHeight')}
      value={lineHeight}
      displayValue={`${Math.round(lineHeight * 10) / 10}%`}
      onChange={val => dispatch(setReaderSettings('lineHeight', val))}
      step={0.1}
      minimumValue={1.3}
      maximumValue={2}
    />
  );
};

export default ReaderLineHeight;

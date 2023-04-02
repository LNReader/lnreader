import { TextStyle } from 'react-native';
import React from 'react';

import { useAppDispatch, useReaderSettings } from '../../../../redux/hooks';
import { setReaderSettings } from '../../../../redux/settings/settings.actions';
import { getString } from '../../../../../strings/translations';
import PlusMinusField from '@components/PlusMinusField/PlusMinusField';

interface ReaderLineHeightProps {
  labelStyle?: TextStyle | TextStyle[];
}

const ReaderLineHeight: React.FC<ReaderLineHeightProps> = ({ labelStyle }) => {
  const dispatch = useAppDispatch();

  const { lineHeight } = useReaderSettings();
  return (
    <PlusMinusField
      labelStyle={labelStyle}
      label={getString('readerScreen.bottomSheet.lineHeight')}
      value={lineHeight}
      displayValue={`${Math.round(lineHeight * 10) / 10}%`}
      onPressMinus={() =>
        dispatch(setReaderSettings('lineHeight', lineHeight - 0.1))
      }
      onPressPlus={() =>
        dispatch(setReaderSettings('lineHeight', lineHeight + 0.1))
      }
      min={1.3}
      max={2}
    />
  );
};

export default ReaderLineHeight;

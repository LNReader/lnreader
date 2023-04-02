import { TextStyle } from 'react-native';
import React from 'react';

import { useAppDispatch, useReaderSettings } from '@redux/hooks';
import { setReaderSettings } from '@redux/settings/settings.actions';
import { getString } from '@strings/translations';
import PlusMinusField from '@components/PlusMinusField/PlusMinusField';

interface ReaderTextSizeProps {
  labelStyle?: TextStyle | TextStyle[];
}

const ReaderTextSize: React.FC<ReaderTextSizeProps> = ({ labelStyle }) => {
  const dispatch = useAppDispatch();

  const { textSize } = useReaderSettings();
  return (
    <PlusMinusField
      labelStyle={labelStyle}
      label={getString('readerScreen.bottomSheet.textSize')}
      value={textSize}
      onPressMinus={() =>
        dispatch(setReaderSettings('textSize', textSize - 0.1))
      }
      onPressPlus={() =>
        dispatch(setReaderSettings('textSize', textSize + 0.1))
      }
      min={0}
    />
  );
};

export default ReaderTextSize;

import { TextStyle } from 'react-native';
import React from 'react';

import { useAppDispatch, useReaderSettings } from '@redux/hooks';
import { setReaderSettings } from '@redux/settings/settings.actions';
import { getString } from '@strings/translations';
import Counter from '@components/Counter/Counter';

interface ReaderTextSizeProps {
  labelStyle?: TextStyle | TextStyle[];
}

const ReaderTextSize: React.FC<ReaderTextSizeProps> = ({ labelStyle }) => {
  const dispatch = useAppDispatch();

  const { textSize } = useReaderSettings();
  return (
    <Counter
      labelStyle={labelStyle}
      label={getString('readerScreen.bottomSheet.textSize')}
      value={textSize}
      onChange={val => dispatch(setReaderSettings('textSize', val))}
      minimumValue={0}
      maximumValue={100}
    />
  );
};

export default ReaderTextSize;

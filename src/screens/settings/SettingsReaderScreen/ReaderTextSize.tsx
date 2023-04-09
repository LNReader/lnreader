import { TextStyle } from 'react-native';
import React from 'react';

import { useAppDispatch, useReaderSettings } from '@redux/hooks';
import { setReaderSettings } from '@redux/settings/settings.actions';
import { getString } from '@strings/translations';
import Counter from '@components/Counter/Counter';

interface ReaderTextSizeProps {
  labelStyle?: TextStyle | TextStyle[];
  onFocus?: (event: Event) => void;
}

const ReaderTextSize: React.FC<ReaderTextSizeProps> = ({
  labelStyle,
  onFocus,
}) => {
  const dispatch = useAppDispatch();

  const { textSize } = useReaderSettings();
  return (
    <Counter
      onFocus={onFocus}
      labelStyle={labelStyle}
      label={getString('readerScreen.bottomSheet.textSize')}
      value={textSize}
      onChange={val => dispatch(setReaderSettings('textSize', val))}
      min={0}
    />
  );
};

export default ReaderTextSize;

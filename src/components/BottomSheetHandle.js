import React from 'react';
import {View} from 'react-native';

const BottomSheetHandle = ({theme}) => (
  <View
    style={{
      backgroundColor: `${theme.textColorPrimary}66`,
      height: 4,
      width: 40,
      borderRadius: 50,
      top: 8,
      alignSelf: 'center',
    }}
  />
);

export default BottomSheetHandle;

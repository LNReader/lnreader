import React from 'react';
import {Text as RNText, TextProps} from 'react-native';

interface Props extends TextProps {
  color?: string;
  size?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  children: string | number;
  padding?: number;
}

const Text: React.FC<Props> = props => (
  <RNText
    style={[
      {
        color: props.color,
        fontSize: props.size,
        paddingHorizontal: props.paddingHorizontal,
        paddingVertical: props.paddingVertical,
        padding: props.padding,
      },
    ]}
    {...props}
  >
    {props.children}
  </RNText>
);

export default Text;

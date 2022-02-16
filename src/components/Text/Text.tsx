import React from 'react';
import {Text as RNText, TextProps} from 'react-native';

interface Props extends TextProps {
  color?: string;
  size?: number;
  padding?: number;
  children: string;
}

const Text: React.FC<Props> = props => (
  <RNText
    style={[
      {
        color: props.color,
        fontSize: props.size,
        padding: props.padding,
      },
    ]}
    {...props}
  >
    {props.children}
  </RNText>
);

export default Text;

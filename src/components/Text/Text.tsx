import React from 'react';
import {Text as RNText} from 'react-native';

interface TextProps {
  color?: string;
  children: string;
}

const Text: React.FC<TextProps> = props => {
  return (
    <RNText style={[{color: props.color}]} {...props}>
      {props.children}
    </RNText>
  );
};

export default Text;

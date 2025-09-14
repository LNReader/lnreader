import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from 'react-native';

import { useTheme } from '@hooks/persisted';

interface TextInputProps extends RNTextInputProps {
  error?: boolean;
  value?: never;
}

const TextInput = (props: TextInputProps) => {
  const theme = useTheme();

  const inputRef = useRef<RNTextInput>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const onFocus: RNTextInputProps['onFocus'] = e => {
    setInputFocused(true);
    props.onFocus?.(e);
  };
  const onBlur: RNTextInputProps['onBlur'] = e => {
    setInputFocused(false);
    props.onBlur?.(e);
  };

  const borderWidth = inputFocused || props.error ? 2 : 1;
  const margin = inputFocused || props.error ? 0 : 1;
  return (
    <RNTextInput
      ref={inputRef}
      placeholderTextColor={'grey'}
      onFocus={onFocus}
      onBlur={onBlur}
      style={[
        {
          color: theme.onBackground,
          backgroundColor: theme.background,
          borderColor: props.error
            ? theme.error
            : inputFocused
            ? theme.primary
            : theme.outline,
          borderWidth: borderWidth,
          margin: margin,
        },
        styles.textInput,
        props.style,
      ]}
      {...props}
    />
  );
};

export default TextInput;

const styles = StyleSheet.create({
  textInput: {
    borderRadius: 4,
    borderStyle: 'solid',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});

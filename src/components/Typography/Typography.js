import React from 'react';
import PropTypes from 'prop-types';
import {Text as NativeText, TextPropTypes} from 'react-native';

const Text = ({type, children, style, theme}) => {
  const color =
    type === 'primary'
      ? theme.textColorPrimary
      : type === 'secondary'
      ? theme.textColorSecondary
      : theme.textColorHint;

  return <NativeText style={[style, {color}]}>{children}</NativeText>;
};

Text.propType = {
  style: TextPropTypes.style,
  type: PropTypes.oneOf(['primary', 'secondary', 'hint']),
  theme: PropTypes.object.isRequired,
};

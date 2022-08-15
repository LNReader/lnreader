import React from 'react';
import PropTypes from 'prop-types';

import { Appbar as MaterialAppbar } from 'react-native-paper';

import { useTheme } from '@hooks/useTheme';
import { ViewPropTypes } from 'react-native';

export const Appbar = ({
  title,
  onBackAction,
  style,
  children,
  mode = 'large',
}) => {
  const theme = useTheme();

  return (
    <MaterialAppbar.Header
      style={[{ backgroundColor: theme.surface }, style]}
      mode={mode}
    >
      {onBackAction && (
        <MaterialAppbar.BackAction
          onPress={onBackAction}
          iconColor={theme.onSurface}
        />
      )}
      <MaterialAppbar.Content
        title={title}
        titleStyle={{ color: theme.onSurface }}
      />
      {children}
    </MaterialAppbar.Header>
  );
};

Appbar.propTypes = {
  title: PropTypes.string,
  onBackAction: PropTypes.func,
  style: ViewPropTypes.style,
};

import React from 'react';
import PropTypes from 'prop-types';

import {Appbar as MaterialAppbar} from 'react-native-paper';

import {useTheme} from '../hooks/reduxHooks';
import {ViewPropTypes} from 'react-native';

export const Appbar = ({title, onBackAction, style, children}) => {
  const theme = useTheme();

  return (
    <MaterialAppbar.Header
      style={[{backgroundColor: theme.colorPrimary}, style]}
    >
      {onBackAction && <MaterialAppbar.BackAction onPress={onBackAction} />}
      <MaterialAppbar.Content
        title={title}
        titleStyle={{color: theme.textColorPrimary}}
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

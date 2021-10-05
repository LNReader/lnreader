import React from 'react';
import {Pressable, StyleSheet, ViewPropTypes} from 'react-native';
import PropTypes from 'prop-types';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const IconButton = ({
  icon,
  size,
  color,
  onPress,
  containerStyle,
  theme,
}) => (
  <Pressable
    style={[styles.container, containerStyle]}
    android_ripple={{color: theme.rippleColor, borderless: true, radius: 24}}
    onPress={onPress}
  >
    <MaterialCommunityIcons name={icon} size={size} color={color} />
  </Pressable>
);

IconButton.defaultProps = {
  size: 24,
};

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  color: PropTypes.string,
  onPress: PropTypes.func,
  containerStyle: ViewPropTypes.style,
  theme: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {padding: 12},
});

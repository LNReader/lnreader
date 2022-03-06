import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import PropTypes from 'prop-types';

export const Chip = ({ label, onPress, theme }) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.colorPrimary }]}>
      <Pressable
        style={styles.content}
        onPress={onPress}
        android_ripple={{ color: theme.rippleColor }}
      >
        <Text style={[styles.label, { color: theme.textColorSecondary }]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
};

Chip.propTypes = {
  label: PropTypes.string,
  onPress: PropTypes.func,
  theme: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    marginHorizontal: 4,
    elevation: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
  },
});

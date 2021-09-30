import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const Checkbox = ({label, status, onPress, theme}) => (
  <View
    style={[
      styles.checkboxContainer,
      status && {backgroundColor: theme.rippleColor},
    ]}
  >
    <Pressable
      android_ripple={{color: theme.rippleColor}}
      style={styles.pressable}
      onPress={onPress}
    >
      <Text
        style={{
          color: status ? theme.colorAccent : theme.textColorPrimary,
        }}
      >
        {label}
      </Text>
      {status && (
        <MaterialCommunityIcons
          name="check"
          color={theme.colorAccent}
          size={21}
          style={styles.icon}
        />
      )}
    </Pressable>
  </View>
);

export const SortItem = ({label, status, onPress, theme}) => (
  <View
    style={[
      styles.checkboxContainer,
      status && {backgroundColor: theme.rippleColor},
    ]}
  >
    <Pressable
      android_ripple={{color: theme.rippleColor}}
      style={styles.pressable}
      onPress={onPress}
    >
      <Text
        style={{
          color: status ? theme.colorAccent : theme.textColorPrimary,
        }}
      >
        {label}
      </Text>
      {status && (
        <MaterialCommunityIcons
          name={status === 'asc' ? 'arrow-up' : 'arrow-down'}
          color={theme.colorAccent}
          size={21}
          style={styles.icon}
        />
      )}
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  checkboxContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
  },
  pressable: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    position: 'absolute',
    right: 16,
    alignSelf: 'center',
  },
});

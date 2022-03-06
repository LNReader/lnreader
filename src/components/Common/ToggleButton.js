import React from 'react';
import { Pressable, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const ToggleButton = ({ icon, selected, theme, color, onPress }) => (
  <View
    style={{
      borderRadius: 8,
      overflow: 'hidden',
      marginHorizontal: 4,
    }}
  >
    <Pressable
      android_ripple={{ color: theme.rippleColor }}
      style={{
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        color={
          selected ? theme.colorAccent : color ? color : theme.textColorPrimary
        }
        size={24}
      />
    </Pressable>
  </View>
);

export const ToggleColorButton = ({
  selected,
  backgroundColor,
  textColor,
  onPress,
}) => (
  <View
    style={{
      borderRadius: 50,
      overflow: 'hidden',
      marginHorizontal: 6,
      height: 44,
      width: 44,
    }}
  >
    <Pressable
      android_ripple={{ color: textColor }}
      style={{
        flex: 1,
        padding: 10,
        backgroundColor: backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={onPress}
    >
      {selected && (
        <MaterialCommunityIcons name="check" color={textColor} size={24} />
      )}
    </Pressable>
  </View>
);

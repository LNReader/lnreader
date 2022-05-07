import React from 'react';
import { Pressable, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeType } from '../../theme/types';

interface ToggleButtonProps {
  icon: string;
  selected: boolean;
  theme: ThemeType;
  color?: string;
  onPress: () => void;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  icon,
  selected,
  theme,
  color,
  onPress,
}) => (
  <View
    style={{
      borderRadius: 6,
      overflow: 'hidden',
      marginHorizontal: 6,
    }}
  >
    <Pressable
      android_ripple={{ color: theme.rippleColor }}
      style={{
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? theme.rippleColor : 'transparent',
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

interface ToggleColorButtonProps {
  selected: boolean;
  backgroundColor: string;
  textColor: string;
  onPress: () => void;
}

export const ToggleColorButton: React.FC<ToggleColorButtonProps> = ({
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

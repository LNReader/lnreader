import { useTheme } from '@providers/Providers';
import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { MaterialDesignIconName } from '@type/icon';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

export type Action = {
  icon: MaterialDesignIconName;
  onPress: () => void;
};

export interface ActionbarProps {
  active: boolean;
  actions: Action[];
  viewStyle?: StyleProp<ViewStyle>;
}

export const Actionbar: React.FC<ActionbarProps> = ({
  active,
  actions,
  viewStyle,
}) => {
  const theme = useTheme();

  const { bottom } = useSafeAreaInsets();

  if (!active) {
    return null;
  }
  return (
    <Animated.View
      entering={SlideInDown.duration(150)}
      exiting={SlideOutDown.duration(150)}
      style={[
        styles.actionbarContainer,
        {
          backgroundColor: theme.surface2,
          minHeight: 80 + bottom,
          paddingBottom: bottom,
        },
        viewStyle,
      ]}
    >
      {actions.map(({ icon, onPress }, id) => (
        <Pressable
          key={id}
          android_ripple={{
            radius: 50,
            color: theme.rippleColor,
            borderless: true,
          }}
          onPress={onPress}
        >
          <MaterialCommunityIcons
            name={icon}
            color={theme.onSurface}
            size={24}
          />
        </Pressable>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  actionbarContainer: {
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    bottom: 0,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    width: Dimensions.get('window').width,
  },
});

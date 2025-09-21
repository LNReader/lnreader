import React, { useCallback } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ThemeColors } from '@theme/types';
import Animated from 'react-native-reanimated';

interface CustomBottomTabBarProps extends BottomTabBarProps {
  theme: ThemeColors;
  showLabelsInNav: boolean;
  renderIcon: ({
    color,
    route,
  }: {
    route: { name: string };
    color: string;
  }) => React.ReactNode;
}

function CustomBottomTabBar({
  navigation,
  state,
  descriptors,
  insets,
  theme,
  showLabelsInNav,
  renderIcon,
}: CustomBottomTabBarProps) {
  const getLabelText = useCallback(
    (route: any) => {
      if (!showLabelsInNav && route.name !== state.routeNames[state.index]) {
        return '';
      }

      const { options } = descriptors[route.key];
      const label =
        typeof options.tabBarLabel === 'string'
          ? options.tabBarLabel
          : typeof options.title === 'string'
          ? options.title
          : route.name;

      return label;
    },
    [descriptors, showLabelsInNav, state.index, state.routeNames],
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.surface2 || theme.surface,
        paddingBottom: insets?.bottom || 0,
        paddingTop: 4,
        paddingHorizontal: 0,
        minHeight: 80,
      }}
    >
      {state.routes.map((route, index) => {
        const label = getLabelText(route);
        const isFocused = state.index === index;
        const showLabel = (showLabelsInNav || isFocused) && label;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconColor = isFocused ? theme.onPrimary : theme.onSurfaceVariant;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 6,
              paddingHorizontal: 4,
              position: 'relative',
            }}
          >
            {/* Icon */}
            <Animated.View
              style={{
                transitionProperty: ['width', 'backgroundColor'],
                transitionDuration: 250,
                transitionTimingFunction: 'ease-out',

                marginBottom: showLabel ? 4 : 20,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 2,
                width: isFocused ? 52 : 32,
                borderRadius: 24,
                backgroundColor: isFocused
                  ? theme.primaryContainer
                  : 'transparent',
              }}
            >
              {renderIcon({ color: iconColor, route })}
            </Animated.View>

            {/* Label */}
            {showLabel ? (
              <Text
                style={{
                  color: theme.onSurfaceVariant,
                  height: 16,
                  fontSize: 12,
                  textAlign: 'center',
                  fontWeight: isFocused ? '700' : '600',
                }}
                numberOfLines={1}
              >
                {label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default CustomBottomTabBar;
export type { CustomBottomTabBarProps };

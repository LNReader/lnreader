import React from 'react';
import {View, Text, Pressable} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const getIconName = tabName => {
  const icons = {
    Library: 'book-variant-multiple',
    Updates: 'alert-decagram-outline',
    History: 'history',
    Browse: 'compass-outline',
    More: 'dots-horizontal',
  };

  return icons[tabName];
};

const BottomNavigationBar = ({
  state,
  descriptors,
  navigation,
  showLabelsInNav,
  theme,
}) => {
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  const insets = useSafeAreaInsets();

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        height: 80 + insets.bottom,
        backgroundColor: theme.colorPrimary,
        paddingBottom: insets.bottom,
      }}
    >
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            android_ripple={{
              color: theme.rippleColor,
              borderless: true,
              radius: 54,
            }}
          >
            <View
              style={[
                {
                  height: 32,
                  width: 64,
                  borderRadius: 50,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 4,
                },
                isFocused && {
                  backgroundColor: theme.colorAccent,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={getIconName(route.name)}
                color={
                  isFocused ? theme.colorPrimary : theme.textColorSecondary
                }
                size={24}
              />
            </View>
            {(showLabelsInNav || isFocused) && (
              <Text
                style={{
                  color: isFocused
                    ? theme.colorAccent
                    : theme.textColorSecondary,
                }}
              >
                {label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default BottomNavigationBar;

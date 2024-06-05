import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, View, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconButtonV2 from '../IconButtonV2/IconButtonV2';
import { ThemeColors } from '../../theme/types';
import { Menu } from 'react-native-paper';

interface RightIcon {
  iconName: string;
  color?: string;
  onPress: () => void;
}

interface MenuButton {
  title: string;
  onPress: () => void;
}

interface SearcbarProps {
  searchText: string;
  placeholder: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  leftIcon: string;
  rightIcons?: RightIcon[];
  menuButtons?: MenuButton[];
  handleBackAction?: () => void;
  clearSearchbar: () => void;
  onLeftIconPress?: () => void;
  theme: ThemeColors;
}

const Searchbar: React.FC<SearcbarProps> = ({
  searchText,
  placeholder,
  onChangeText,
  onSubmitEditing,
  leftIcon,
  rightIcons,
  menuButtons,
  handleBackAction,
  clearSearchbar,
  onLeftIconPress,
  theme,
}) => {
  const searchbarRef = useRef<any>(null);
  const focusSearchbar = () => searchbarRef.current.focus();
  const [extraMenu, showExtraMenu] = useState(false);

  const { top, right, left } = useSafeAreaInsets();
  const marginTop = top + 8;
  const marginRight = right + 16;
  const marginLeft = left + 16;

  return (
    <View
      style={[
        styles.searchbarContainer,
        {
          marginTop,
          marginRight,
          marginLeft,
          backgroundColor: theme.surface2,
        },
      ]}
    >
      <Pressable
        onPress={focusSearchbar}
        android_ripple={{ color: theme.rippleColor }}
        style={[styles.searchbar]}
      >
        <IconButtonV2
          name={handleBackAction ? 'arrow-left' : leftIcon}
          color={theme.onSurface}
          onPress={() => {
            if (handleBackAction) {
              handleBackAction();
            } else if (onLeftIconPress) {
              onLeftIconPress();
            }
          }}
          theme={theme}
        />

        <TextInput
          ref={searchbarRef}
          style={[styles.textInput, { color: theme.onSurface }]}
          placeholder={placeholder}
          placeholderTextColor={theme.onSurface}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          defaultValue={searchText}
        />
        {searchText !== '' ? (
          <IconButtonV2
            name="close"
            color={theme.onSurface}
            onPress={clearSearchbar}
            theme={theme}
          />
        ) : null}
        {rightIcons?.map((icon, index) => (
          <IconButtonV2
            key={index}
            name={icon.iconName}
            color={icon.color || theme.onSurface}
            onPress={icon.onPress}
            theme={theme}
          />
        ))}
        {menuButtons?.length ? (
          <Menu
            visible={extraMenu}
            onDismiss={() => showExtraMenu(false)}
            anchor={
              <IconButtonV2
                name="dots-vertical"
                color={theme.onSurface}
                onPress={() => showExtraMenu(true)}
                theme={theme}
              />
            }
            contentStyle={{
              backgroundColor: theme.surface2,
            }}
          >
            {menuButtons?.map((button, index) => (
              <Menu.Item
                key={index}
                title={button.title}
                style={{ backgroundColor: theme.surface2 }}
                titleStyle={{
                  color: theme.onSurface,
                }}
                onPress={() => {
                  showExtraMenu(false);
                  button.onPress();
                }}
              />
            ))}
          </Menu>
        ) : null}
      </Pressable>
    </View>
  );
};

export default Searchbar;

const styles = StyleSheet.create({
  searchbarContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    minHeight: 56,
    borderRadius: 50,
    overflow: 'hidden',
    zIndex: 1,
  },
  searchbar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 8,
  },
  icon: {
    marginHorizontal: 8,
  },
  searchIconContainer: {
    borderRadius: 50,
    overflow: 'hidden',
  },
});

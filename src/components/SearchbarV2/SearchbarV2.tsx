import React, { useRef } from 'react';
import { Pressable, StyleSheet, View, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconButtonV2 from '../IconButtonV2/IconButtonV2';
import { ThemeType } from '../../theme/types';

interface RightIcon {
  iconName: string;
  color?: string;
  onPress: () => void;
}

interface SearcbarProps {
  searchText: string;
  placeholder: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  leftIcon: string;
  rightIcons?: RightIcon[];
  handleBackAction?: () => void;
  clearSearchbar: () => void;
  onLeftIconPress?: () => void;
  theme: ThemeType;
}

const Searchbar: React.FC<SearcbarProps> = ({
  searchText,
  placeholder,
  onChangeText,
  onSubmitEditing,
  leftIcon,
  rightIcons,
  handleBackAction,
  clearSearchbar,
  onLeftIconPress,
  theme,
}) => {
  const searchbarRef = useRef<any>(null);
  const focusSearchbar = () => searchbarRef.current.focus();

  const { top } = useSafeAreaInsets();
  const marginTop = top + 8;

  return (
    <View
      style={[
        styles.searchbarContainer,
        { marginTop, backgroundColor: theme.searchBarColor },
      ]}
    >
      <Pressable
        onPress={focusSearchbar}
        android_ripple={{ color: theme.rippleColor }}
        style={[styles.searchbar]}
      >
        <IconButtonV2
          name={handleBackAction ? 'arrow-left' : leftIcon}
          color={theme.textColorPrimary}
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
          style={[styles.textInput, { color: theme.textColorPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textColorSecondary}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          defaultValue={searchText}
        />
        {searchText !== '' ? (
          <IconButtonV2
            name="close"
            color={theme.textColorPrimary}
            onPress={clearSearchbar}
            theme={theme}
          />
        ) : null}
        {rightIcons?.map((icon, index) => (
          <IconButtonV2
            key={index}
            name={icon.iconName}
            color={icon.color || theme.textColorPrimary}
            onPress={icon.onPress}
            theme={theme}
          />
        ))}
      </Pressable>
    </View>
  );
};

export default Searchbar;

const styles = StyleSheet.create({
  searchbarContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    minHeight: 46,
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

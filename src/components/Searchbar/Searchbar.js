import React, {useRef} from 'react';
import {StyleSheet, View, TextInput, StatusBar, Pressable} from 'react-native';

import {Row} from '../Common';
import {IconButton} from '../IconButton/IconButton';

export const Searchbar = ({
  theme,
  placeholder,
  searchText,
  backAction,
  onBackAction,
  clearSearchbar,
  onChangeText,
  onSubmitEditing,
  actions,
}) => {
  const searchRef = useRef(null);

  return (
    <View style={styles.searchBar}>
      <Pressable
        onPress={() => searchRef.current.focus()}
        style={[styles.pressable, {backgroundColor: theme.searchBarColor}]}
        android_ripple={{color: theme.rippleColor}}
      >
        <Row style={{flex: 1}}>
          {backAction && (
            <IconButton
              icon={backAction}
              color={theme.textColorPrimary}
              onPress={onBackAction}
              theme={theme}
              containerStyle={{marginLeft: 0}}
            />
          )}
          <TextInput
            ref={searchRef}
            style={{fontSize: 16, color: theme.textColorPrimary, marginLeft: 4}}
            placeholder={placeholder}
            placeholderTextColor={theme.textColorSecondary}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            defaultValue={searchText}
          />
        </Row>
        {searchText !== '' && (
          <IconButton
            icon="close"
            color={theme.textColorPrimary}
            onPress={clearSearchbar}
            theme={theme}
          />
        )}
        {actions &&
          actions.map((action, index) => (
            <IconButton
              key={index}
              icon={action.icon}
              color={action.color ?? theme.textColorPrimary}
              onPress={action.onPress}
              theme={theme}
              containerStyle={{marginRight: 0, marginLeft: 16}}
            />
          ))}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    marginTop: StatusBar.currentHeight + 8,
    marginBottom: 8,
    marginHorizontal: 16,
    height: 48,
    borderRadius: 50,
    overflow: 'hidden',
  },
  pressable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});

import React, {useRef} from 'react';
import {StyleSheet, View, TextInput, StatusBar, Pressable} from 'react-native';

import {IconButton} from 'react-native-paper';
import {Row} from '../Common';

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
              style={{marginLeft: 0}}
              size={23}
              onPress={onBackAction}
              rippleColor={theme.rippleColor}
            />
          )}
          <TextInput
            ref={searchRef}
            style={{
              fontSize: 16,
              color: theme.textColorPrimary,
            }}
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
            style={{marginRight: 0}}
            size={23}
            onPress={clearSearchbar}
            rippleColor={theme.rippleColor}
          />
        )}
        {actions &&
          actions.map((action, index) => (
            <IconButton
              key={index}
              icon={action.icon}
              color={action.color ?? theme.textColorPrimary}
              style={{marginRight: 0}}
              size={23}
              onPress={action.onPress}
              rippleColor={theme.rippleColor}
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

import React from 'react';
import {Dimensions, StatusBar, StyleSheet, Text, View} from 'react-native';
import {Appbar} from 'react-native-paper';

import {CrossFadeView} from '../../../../components';
import {ThemeType} from '../../../../theme/types';

interface SelectionAppbarProps {
  selectedChapters: number;
  selectAllChapters: () => void;
  clearSelection: () => void;
  theme: ThemeType;
}

const SelectionAppbar: React.FC<SelectionAppbarProps> = ({
  selectedChapters,
  clearSelection,
  selectAllChapters,
  theme,
}) => {
  return (
    <CrossFadeView
      style={{
        position: 'absolute',
        zIndex: 1,
        width: Dimensions.get('window').width,
        elevation: 2,
      }}
      animationDuration={100}
    >
      <View
        style={{
          backgroundColor: theme.surface,
          paddingTop: StatusBar.currentHeight,
          flexDirection: 'row',
          alignItems: 'center',
          paddingBottom: 8,
        }}
      >
        <Appbar.Action
          icon="close"
          color={theme.textColorPrimary}
          onPress={clearSelection}
        />
        <Appbar.Content
          title={selectedChapters}
          titleStyle={{color: theme.textColorPrimary}}
        />
        <Appbar.Action
          icon="select-all"
          color={theme.textColorPrimary}
          onPress={selectAllChapters}
        />
      </View>
    </CrossFadeView>
  );
};

export default SelectionAppbar;

const styles = StyleSheet.create({});

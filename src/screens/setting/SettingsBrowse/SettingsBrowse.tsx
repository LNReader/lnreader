import React from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Container, Appbar, SwitchItem} from '../../../components';

import {
  useAppDispatch,
  useSourcesReducer,
  useTheme,
} from '../../../redux/hooks';
import {sourceLanguages} from './utils/sourceLanguages';
import {toggleLanguageFilter} from '../../../redux/sources/sourcesSlice';

const SettingsBrowse = () => {
  const {goBack} = useNavigation();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const {languageFilters} = useSourcesReducer();

  return (
    <Container>
      <Appbar title="Sources" handleGoBack={goBack} theme={theme} />
      <FlatList
        data={sourceLanguages}
        keyExtractor={item => item}
        renderItem={({item}) => (
          <SwitchItem
            label={item}
            onPress={() => dispatch(toggleLanguageFilter({language: item}))}
            value={languageFilters.indexOf(item) > -1}
            theme={theme}
          />
        )}
      />
    </Container>
  );
};

export default SettingsBrowse;

const styles = StyleSheet.create({});

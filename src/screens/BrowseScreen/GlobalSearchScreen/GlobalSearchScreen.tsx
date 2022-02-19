import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  ErrorScreen,
  GlobalSearchNovelList,
  Searchbar,
} from '../../../components';
import {useSearch} from '../../../hooks';
import {useTheme} from '../../../redux/hooks';
import {useGlobalSearch} from './hooks/useGlobalSearch';

const GlobalSearchScreen = () => {
  const theme = useTheme();
  const {goBack} = useNavigation();

  const {searchNovel, clearSearchResults, error, progress, searchResults} =
    useGlobalSearch();

  const {searchText, setSearchText, clearSearchbar} = useSearch();
  const onChangeText = (text: string) => setSearchText(text);
  const onSubmitEditing = () => searchNovel(searchText);
  const handleClearSearchbar = () => {
    clearSearchbar();
    clearSearchResults();
  };

  return (
    <>
      <Searchbar
        searchText={searchText}
        leftIcon="magnify"
        placeholder="Global search"
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        clearSearchbar={handleClearSearchbar}
        handleBackAction={goBack}
        theme={theme}
      />
      {error ? (
        <ErrorScreen error={error} theme={theme} />
      ) : (
        <GlobalSearchNovelList data={searchResults} theme={theme} />
      )}
    </>
  );
};

export default GlobalSearchScreen;

const styles = StyleSheet.create({});

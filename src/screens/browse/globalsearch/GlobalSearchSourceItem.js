import React from 'react';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';

import GlobalSearchNovelList from './GlobalSearchNovelList';

const GlobalSearchSourceItem = ({source, library, theme, navigation}) => {
  const {sourceName, lang, loading, novels, error} = source;

  const colorError = {
    color: theme.statusBar === 'dark-content' ? '#B3261E' : '#F2B8B5',
  };

  return (
    <>
      <View style={styles.sourceContainer}>
        <Text style={{color: theme.textColorPrimary}}>{sourceName}</Text>
        <Text style={{color: theme.textColorSecondary, fontSize: 12}}>
          {lang}
        </Text>
      </View>
      {error ? (
        <Text style={[styles.error, colorError]}>{error}</Text>
      ) : loading ? (
        <ActivityIndicator
          color={theme.colorAccent}
          style={{marginVertical: 16}}
        />
      ) : (
        <GlobalSearchNovelList
          data={novels}
          theme={theme}
          library={library}
          navigation={navigation}
        />
      )}
    </>
  );
};

export default GlobalSearchSourceItem;

const styles = StyleSheet.create({
  sourceContainer: {
    padding: 8,
    paddingVertical: 16,
  },
  error: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
});

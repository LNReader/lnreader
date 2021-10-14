import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';

import {Switch} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';

import {Appbar} from '../../components/Appbar';
import {List} from '../../components/List';

import {useSettings, useTheme} from '../../hooks/reduxHooks';
import {setAppSettings} from '../../redux/settings/settings.actions';
import {
  enableDiscover,
  filterLanguage,
} from '../../redux/source/source.actions';

const BrowseSettings = ({navigation}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const {filters = [], showMyAnimeList = true} = useSelector(
    state => state.sourceReducer,
  );

  const languages = [
    'English',
    'Spanish',
    'Japanese',
    'Chinese',
    'Arabic',
    'Indonesian',
    'Russian',
    'Turkish',
    'French',
    'Portuguese (Brazil)',
  ].sort();

  const {searchAllSources = false, onlyShowPinnedSources = false} =
    useSettings();

  const renderItem = ({item}) => {
    return (
      <Pressable
        android_ripple={{color: theme.rippleColor}}
        style={styles.switch}
        onPress={() => dispatch(filterLanguage(item))}
      >
        <Text style={{color: theme.textColorPrimary}}>{item}</Text>
        <Switch
          color={theme.colorAccent}
          value={filters.indexOf(item) === -1 ? true : false}
          onValueChange={() => dispatch(filterLanguage(item))}
        />
      </Pressable>
    );
  };

  return (
    <View style={{flex: 1}}>
      <Appbar onBackAction={navigation.goBack} title="Browse" />
      <FlatList
        contentContainerStyle={{paddingBottom: 32}}
        data={languages}
        keyExtractor={item => item}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            <List.SubHeader theme={theme}>Global Search</List.SubHeader>
            <Pressable
              android_ripple={{color: theme.rippleColor}}
              style={styles.switch}
              onPress={() =>
                dispatch(setAppSettings('searchAllSources', !searchAllSources))
              }
            >
              <Text style={{color: theme.textColorPrimary}}>
                Search all sources
              </Text>
              <Switch
                color={theme.colorAccent}
                value={searchAllSources}
                onValueChange={() =>
                  dispatch(
                    setAppSettings('searchAllSources', !searchAllSources),
                  )
                }
              />
            </Pressable>
            <List.Divider theme={theme} />
            <List.SubHeader theme={theme}>Browse</List.SubHeader>
            <Pressable
              android_ripple={{color: theme.rippleColor}}
              style={styles.switch}
              onPress={() => dispatch(enableDiscover('showMyAnimeList'))}
            >
              <Text style={{color: theme.textColorPrimary}}>MyAnimeList</Text>
              <Switch
                color={theme.colorAccent}
                value={showMyAnimeList}
                onValueChange={() =>
                  dispatch(enableDiscover('showMyAnimeList'))
                }
              />
            </Pressable>
            <Pressable
              android_ripple={{color: theme.rippleColor}}
              style={styles.switch}
              onPress={() =>
                dispatch(
                  setAppSettings(
                    'onlyShowPinnedSources',
                    !onlyShowPinnedSources,
                  ),
                )
              }
            >
              <Text style={{color: theme.textColorPrimary}}>
                Only show pinned sources
              </Text>
              <Switch
                color={theme.colorAccent}
                value={onlyShowPinnedSources}
                onValueChange={() =>
                  dispatch(
                    setAppSettings(
                      'onlyShowPinnedSources',
                      !onlyShowPinnedSources,
                    ),
                  )
                }
              />
            </Pressable>
            <List.Divider theme={theme} />
            <List.SubHeader theme={theme}>Languages</List.SubHeader>
          </View>
        }
      />
    </View>
  );
};

export default BrowseSettings;

const styles = StyleSheet.create({
  switch: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

import { FlatList, StyleSheet } from 'react-native';
import React from 'react';
import { Appbar, List, SwitchItem } from '../../components';

import {
  useAppDispatch,
  useBrowseSettings,
  useSourcesReducer,
  useThemeV1,
} from '../../redux/hooks';
import { useNavigation } from '@react-navigation/native';
import { getString } from '../../../strings/translations';
import { languages } from '../../utils/constants/languages';
import { toggleLanguageFilter } from '../../redux/source/sourcesSlice';
import { setBrowseSettings } from '../../redux/settings/settingsSlice';

const BrowseSettings = () => {
  const theme = useThemeV1();
  const { goBack } = useNavigation();
  const dispatch = useAppDispatch();

  const { languageFilters } = useSourcesReducer();
  const {
    searchAllSources = false,
    showMyAnimeList = true,
    onlyShowPinnedSources = false,
  } = useBrowseSettings();

  return (
    <>
      <Appbar
        title={getString('moreScreen.settingsScreen.browseSettings')}
        handleGoBack={goBack}
        theme={theme}
      />
      <FlatList
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <List.SubHeader theme={theme}>
              {getString('browseScreen.globalSearch')}
            </List.SubHeader>
            <SwitchItem
              label={getString(
                'moreScreen.settingsScreen.browseSettingsScreen.searchAllSources',
              )}
              value={searchAllSources}
              onPress={() =>
                dispatch(
                  setBrowseSettings({
                    key: 'searchAllSources',
                    value: !searchAllSources,
                  }),
                )
              }
              theme={theme}
            />
            <List.InfoItem
              title={getString(
                'moreScreen.settingsScreen.browseSettingsScreen.searchAllWarning',
              )}
              icon="information-outline"
              theme={theme}
            />
            <List.Divider theme={theme} />
            <List.SubHeader theme={theme}>
              {getString('browseScreen.discover')}
            </List.SubHeader>
            <SwitchItem
              label="Show MyAnimeList"
              value={showMyAnimeList}
              onPress={() =>
                dispatch(
                  setBrowseSettings({
                    key: 'showMyAnimeList',
                    value: !showMyAnimeList,
                  }),
                )
              }
              theme={theme}
            />
            <SwitchItem
              label={getString(
                'moreScreen.settingsScreen.browseSettingsScreen.onlyShowPinnedSources',
              )}
              value={onlyShowPinnedSources}
              onPress={() =>
                dispatch(
                  setBrowseSettings({
                    key: 'onlyShowPinnedSources',
                    value: !onlyShowPinnedSources,
                  }),
                )
              }
              theme={theme}
            />
            <List.Divider theme={theme} />
            <List.SubHeader theme={theme}>
              {getString(
                'moreScreen.settingsScreen.browseSettingsScreen.languages',
              )}
            </List.SubHeader>
          </>
        }
        keyExtractor={item => item}
        data={languages}
        renderItem={({ item }) => (
          <SwitchItem
            label={item}
            value={languageFilters.indexOf(item) !== -1}
            onPress={() => dispatch(toggleLanguageFilter({ language: item }))}
            theme={theme}
          />
        )}
      />
    </>
  );
};

export default BrowseSettings;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
});

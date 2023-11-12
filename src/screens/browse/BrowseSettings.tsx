import { FlatList, StyleSheet } from 'react-native';
import React from 'react';
import { Appbar, List, SwitchItem } from '@components';

import {
  useAppDispatch,
  useBrowseSettings,
  usePluginReducer,
} from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';
import { availableLanguages } from '@utils/constants/languages';
import { toggleLanguageFilter } from '@redux/plugins/pluginsSlice';
import { setBrowseSettings } from '@redux/settings/settingsSliceV2';
import { BrowseSettingsScreenProp } from '@navigators/types';

const BrowseSettings = ({ navigation }: BrowseSettingsScreenProp) => {
  const theme = useTheme();
  const { goBack } = navigation;
  const dispatch = useAppDispatch();

  const { languagesFilter } = usePluginReducer();
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
        data={availableLanguages}
        renderItem={({ item }) => (
          <SwitchItem
            label={item}
            value={languagesFilter.indexOf(item) !== -1}
            onPress={() => dispatch(toggleLanguageFilter(item))}
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

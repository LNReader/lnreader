import { FlatList, StyleSheet } from 'react-native';
import React from 'react';
import { Appbar, List, SwitchItem } from '@components';

import { useBrowseSettings, usePlugins, useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';
import { availableLanguages } from '@utils/constants/languages';
import { BrowseSettingsScreenProp } from '@navigators/types';

const BrowseSettings = ({ navigation }: BrowseSettingsScreenProp) => {
  const theme = useTheme();
  const { goBack } = navigation;

  const { languagesFilter, toggleLanguageFilter } = usePlugins();
  const { showMyAnimeList, showAniList, setBrowseSettings } =
    useBrowseSettings();

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
              label="Show AniList"
              value={showAniList}
              onPress={() => setBrowseSettings({ showAniList: !showAniList })}
              theme={theme}
            />
            <SwitchItem
              label="Show MyAnimeList"
              value={showMyAnimeList}
              onPress={() =>
                setBrowseSettings({ showMyAnimeList: !showMyAnimeList })
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
            value={languagesFilter.includes(item)}
            onPress={() => toggleLanguageFilter(item)}
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

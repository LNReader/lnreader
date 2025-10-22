import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import * as Linking from 'expo-linking';

import { getString } from '@strings/translations';
import { MoreHeader } from './components/MoreHeader';
import { useTheme } from '@hooks/persisted';
import { List, SafeAreaView } from '@components';
import { AboutScreenProps } from '@navigators/types';
import { GIT_HASH, RELEASE_DATE, BUILD_TYPE } from '@env';
import * as Clipboard from 'expo-clipboard';
import { version } from '../../../package.json';
import { Links } from '@utils/constants/links';
import { StringMap } from '@strings/types';

const AboutScreen = ({ navigation }: AboutScreenProps) => {
  const theme = useTheme();

  function getBuildName() {
    if (!GIT_HASH || !RELEASE_DATE || !BUILD_TYPE) {
      return `Custom build ${version}`;
    } else {
      const localDateTime = isNaN(Number(RELEASE_DATE))
        ? RELEASE_DATE
        : new Date(Number(RELEASE_DATE)).toLocaleString();
      if (BUILD_TYPE === 'Release') {
        return `${BUILD_TYPE} ${version} (${localDateTime})`;
      }
      return `${BUILD_TYPE} ${version} (${localDateTime}) Commit: ${GIT_HASH}`;
    }
  }

  return (
    <SafeAreaView excludeTop>
      <MoreHeader
        title={getString('common.about')}
        navigation={navigation}
        theme={theme}
        goBack={true}
      />
      <ScrollView style={styles.flex}>
        <List.Section>
          <List.Item
            title={getString('aboutScreen.version')}
            description={getBuildName()}
            theme={theme}
            onPress={() => {
              Clipboard.setStringAsync(getBuildName());
            }}
          />
          <List.Item
            title={getString('aboutScreen.whatsNew')}
            onPress={() =>
              Linking.openURL(
                `https://github.com/LNReader/lnreader/releases/tag/v${version}`,
              )
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          {
            Object.entries({
              'aboutScreen.website': Links.officialSite,
              'aboutScreen.discord': Links.discord,
              'aboutScreen.github': Links.github,
              'aboutScreen.sources': Links.officialPluginRepo,
              'aboutScreen.helpTranslate': Links.crowdin,
            } as Record<keyof StringMap, string>).map(([title, url]) => (
              <List.Item
                key={title}
                title={getString(title as keyof StringMap)}
                onPress={() => Linking.openURL(url)}
                theme={theme}
              />
            ))
          }
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

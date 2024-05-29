import React from 'react';
import { ScrollView } from 'react-native';

import * as Linking from 'expo-linking';

import { getString } from '@strings/translations';
import { ScreenContainer } from '@components/Common';
import { MoreHeader } from './components/MoreHeader';
import { useTheme } from '@hooks/persisted';
import { List } from '@components';
import { AboutScreenProps } from '@navigators/types';
import { GIT_HASH, RELEASE_DATE, BUILD_TYPE } from '@env';
import * as Clipboard from 'expo-clipboard';
import { version } from '../../../package.json';

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
    <ScreenContainer theme={theme}>
      <MoreHeader
        title={getString('common.about')}
        navigation={navigation}
        theme={theme}
        goBack={true}
      />
      <ScrollView style={{ flex: 1 }}>
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
          <List.Item
            title={getString('aboutScreen.discord')}
            description="https://discord.gg/QdcWN4MD63"
            onPress={() => Linking.openURL('https://discord.gg/QdcWN4MD63')}
            theme={theme}
          />
          <List.Item
            title={getString('aboutScreen.github')}
            description="https://github.com/LNReader/lnreader"
            onPress={() =>
              Linking.openURL('https://github.com/LNReader/lnreader')
            }
            theme={theme}
          />
          <List.Item
            title={getString('aboutScreen.sources')}
            description="https://github.com/LNReader/lnreader-sources"
            onPress={() =>
              Linking.openURL('https://github.com/LNReader/lnreader-sources')
            }
            theme={theme}
          />
          <List.Item
            title={getString('aboutScreen.helpTranslate')}
            description="https://crowdin.com/project/lnreader"
            onPress={() =>
              Linking.openURL('https://crowdin.com/project/lnreader')
            }
            theme={theme}
          />
        </List.Section>
      </ScrollView>
    </ScreenContainer>
  );
};

export default AboutScreen;

import React from 'react';
import {ScrollView} from 'react-native';
import * as Linking from 'expo-linking';

import {List} from '../../components';
import AboutScreenHeader from './components/AboutScreenHeader/AboutScreenHeader';

import {appVersion, releaseDate} from '../../utils/constants/appVersion';

import {useTheme} from '../../redux/hooks';

const AboutScreen = () => {
  const theme = useTheme();

  return (
    <>
      <AboutScreenHeader theme={theme} />
      <ScrollView>
        <List.Section>
          <List.Item
            title="Version"
            description={`Stable ${appVersion} (${releaseDate})`}
            theme={theme}
          />
          <List.Item
            title="What's new"
            onPress={() =>
              Linking.openURL(
                `https://github.com/LNReader/lnreader/releases/tag/v${appVersion}`,
              )
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.Item
            title="Discord"
            description="https://discord.gg/QdcWN4MD63"
            onPress={() => Linking.openURL('https://discord.gg/QdcWN4MD63')}
            theme={theme}
          />
          <List.Item
            title="Github"
            description="https://github.com/LNReader/lnreader"
            onPress={() =>
              Linking.openURL('https://github.com/LNReader/lnreader')
            }
            theme={theme}
          />
          <List.Item
            title="Sources"
            description="https://github.com/LNReader/lnreader-sources"
            onPress={() =>
              Linking.openURL('https://github.com/LNReader/lnreader-sources')
            }
            theme={theme}
          />
        </List.Section>
      </ScrollView>
    </>
  );
};

export default AboutScreen;

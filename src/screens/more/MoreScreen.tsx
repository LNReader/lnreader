import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';
import {Container, List} from '../../components';
import {useAppSelector, useTheme} from '../../redux/hooks';
import MoreScreenHeader from './components/MoreScreenHeader/MoreScreenHeader';

const MoreScreen = () => {
  const theme = useTheme();
  const {navigate} = useNavigation();
  const {downloadQueue} = useAppSelector(state => state.downloadsReducer);

  return (
    <Container>
      <MoreScreenHeader theme={theme} />
      <List.Section>
        <List.Item
          title="Download queue"
          description={
            downloadQueue.length > 0
              ? `${downloadQueue.length} remaining`
              : null
          }
          icon="progress-download"
          onPress={() =>
            navigate(
              'MoreStack' as never,
              {
                screen: 'DownloadQueue',
              } as never,
            )
          }
          theme={theme}
        />
        <List.Item
          title="Downloads"
          icon="folder-download"
          onPress={() =>
            navigate('MoreStack' as never, {screen: 'Downloads'} as never)
          }
          theme={theme}
        />
        <List.Divider theme={theme} />
        <List.Item
          title="Settings"
          icon="cog-outline"
          onPress={() =>
            navigate('MoreStack' as never, {screen: 'SettingsStack'} as never)
          }
          theme={theme}
        />
        <List.Item
          title="About"
          icon="information-outline"
          onPress={() =>
            navigate('MoreStack' as never, {screen: 'About'} as never)
          }
          theme={theme}
        />
      </List.Section>
    </Container>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({});

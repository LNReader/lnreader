import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import {
  Portal,
  Text,
  Button,
  Provider,
  List as PaperList,
} from 'react-native-paper';

import { getTracker, useTheme, useTracker } from '@hooks/persisted';
import { Appbar, List, Modal, SafeAreaView } from '@components';
import { TrackerSettingsScreenProps } from '@navigators/types';
import { getString } from '@strings/translations';
import MangaUpdatesLoginDialog from './components/MangaUpdatesLoginDialog';
import { authenticateWithCredentials } from '@services/Trackers/mangaUpdates';
import { showToast } from '@utils/showToast';

const AniListLogo = () => (
  <View style={styles.logoContainer}>
    <Image
      source={require('../../../assets/anilist.png')}
      style={styles.trackerLogo}
    />
  </View>
);

const MyAnimeListLogo = () => (
  <View style={styles.logoContainer}>
    <Image
      source={require('../../../assets/mal.png')}
      style={styles.trackerLogo}
    />
  </View>
);

const MangaUpdatesLogo = () => (
  <View style={styles.logoContainer}>
    <Image
      source={require('../../../assets/mangaupdates.png')}
      style={styles.trackerLogo}
    />
  </View>
);

const TrackerScreen = ({ navigation }: TrackerSettingsScreenProps) => {
  const theme = useTheme();
  const { tracker, removeTracker, setTracker } = useTracker();

  // Tracker Modal
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  // MangaUpdates Login Dialog
  const [mangaUpdatesLoginVisible, setMangaUpdatesLoginVisible] =
    useState(false);
  const showMangaUpdatesLogin = () => setMangaUpdatesLoginVisible(true);
  const hideMangaUpdatesLogin = () => setMangaUpdatesLoginVisible(false);

  const handleMangaUpdatesLogin = async (
    username: string,
    password: string,
  ) => {
    try {
      const auth = await authenticateWithCredentials(username, password);
      setTracker('MangaUpdates', auth);
      hideMangaUpdatesLogin();
      showToast('Successfully logged in to MangaUpdates');
    } catch (error) {
      if (error instanceof Error) {
        throw error; // Let the dialog handle the error display
      }
      throw new Error('Failed to authenticate with MangaUpdates');
    }
  };

  return (
    <SafeAreaView excludeTop>
      <Provider>
        <Appbar
          title={getString('tracking')}
          handleGoBack={() => navigation.goBack()}
          theme={theme}
        />
        <View
          style={[
            { backgroundColor: theme.background },
            styles.flex1,
            styles.screenPadding,
          ]}
        >
          <List.Section>
            <List.SubHeader theme={theme}>
              {getString('trackingScreen.services')}
            </List.SubHeader>
            <PaperList.Item
              title="AniList"
              titleStyle={{ color: theme.onSurface }}
              left={AniListLogo}
              right={
                tracker?.name === 'AniList'
                  ? () => (
                      <PaperList.Icon
                        color={theme.primary}
                        icon="check"
                        style={styles.iconStyle}
                      />
                    )
                  : undefined
              }
              onPress={async () => {
                if (tracker) {
                  showModal();
                } else {
                  const auth = await getTracker('AniList').authenticate();
                  if (auth) {
                    setTracker('AniList', auth);
                  }
                }
              }}
              rippleColor={theme.rippleColor}
              style={styles.listItem}
            />
            <PaperList.Item
              title="MyAnimeList"
              titleStyle={{ color: theme.onSurface }}
              left={MyAnimeListLogo}
              right={
                tracker?.name === 'MyAnimeList'
                  ? () => (
                      <PaperList.Icon
                        color={theme.primary}
                        icon="check"
                        style={styles.iconStyle}
                      />
                    )
                  : undefined
              }
              onPress={async () => {
                if (tracker) {
                  showModal();
                } else {
                  const auth = await getTracker('MyAnimeList').authenticate();
                  if (auth) {
                    setTracker('MyAnimeList', auth);
                  }
                }
              }}
              rippleColor={theme.rippleColor}
              style={styles.listItem}
            />
            <PaperList.Item
              title="MangaUpdates"
              titleStyle={{ color: theme.onSurface }}
              left={MangaUpdatesLogo}
              right={
                tracker?.name === 'MangaUpdates'
                  ? () => (
                      <PaperList.Icon
                        color={theme.primary}
                        icon="check"
                        style={styles.iconStyle}
                      />
                    )
                  : undefined
              }
              onPress={() => {
                if (tracker) {
                  showModal();
                } else {
                  showMangaUpdatesLogin();
                }
              }}
              rippleColor={theme.rippleColor}
              style={styles.listItem}
            />
            {tracker?.name === 'MyAnimeList' &&
            tracker?.auth.expiresAt < new Date(Date.now()) ? (
              <>
                <List.Divider theme={theme} />
                <List.SubHeader theme={theme}>
                  {getString('common.settings')}
                </List.SubHeader>
                <List.Item
                  title={
                    getString('trackingScreen.revalidate') + ' Myanimelist'
                  }
                  onPress={async () => {
                    const revalidate = getTracker('MyAnimeList')?.revalidate;
                    if (revalidate) {
                      const auth = await revalidate(tracker.auth);
                      setTracker('MyAnimeList', auth);
                    }
                  }}
                  theme={theme}
                />
              </>
            ) : null}
          </List.Section>

          <Portal>
            <Modal visible={visible} onDismiss={hideModal}>
              <Text style={[{ color: theme.onSurface }, styles.modalText]}>
                {getString('trackingScreen.logOutMessage', {
                  name: tracker?.name,
                })}
              </Text>
              <View style={styles.modalButtonRow}>
                <Button
                  style={styles.modalButton}
                  labelStyle={[
                    { color: theme.primary },
                    styles.modalButtonLabel,
                  ]}
                  onPress={hideModal}
                >
                  {getString('common.cancel')}
                </Button>
                <Button
                  style={styles.modalButton}
                  labelStyle={[
                    { color: theme.primary },
                    styles.modalButtonLabel,
                  ]}
                  onPress={() => {
                    removeTracker();
                    hideModal();
                  }}
                >
                  {getString('common.logout')}
                </Button>
              </View>
            </Modal>
            <MangaUpdatesLoginDialog
              visible={mangaUpdatesLoginVisible}
              onDismiss={hideMangaUpdatesLogin}
              onSubmit={handleMangaUpdatesLogin}
            />
          </Portal>
        </View>
      </Provider>
    </SafeAreaView>
  );
};

export default TrackerScreen;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  screenPadding: {
    paddingVertical: 8,
  },
  modalText: {
    fontSize: 18,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginTop: 30,
  },
  modalButtonLabel: {
    letterSpacing: 0,
    textTransform: 'none',
  },
  logoContainer: {
    paddingLeft: 16,
    justifyContent: 'center',
  },
  trackerLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    borderRadius: 4,
  },
  listItem: {
    paddingVertical: 12,
  },
  iconStyle: {
    margin: 0,
  },
});

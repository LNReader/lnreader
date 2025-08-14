import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Text, Button, Provider } from 'react-native-paper';

import { getTracker, useTheme, useTracker } from '@hooks/persisted';
import { Appbar, List, Modal, SafeAreaView } from '@components';
import { TrackerSettingsScreenProps } from '@navigators/types';
import { getString } from '@strings/translations';

const TrackerScreen = ({ navigation }: TrackerSettingsScreenProps) => {
  const theme = useTheme();
  const { tracker, removeTracker, setTracker } = useTracker();

  // Tracker Modal
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

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
            <List.Item
              title="AniList"
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
              right={tracker?.name === 'AniList' ? 'check' : undefined}
              theme={theme}
            />
            <List.Item
              title="MyAnimeList"
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
              right={tracker?.name === 'MyAnimeList' ? 'check' : undefined}
              theme={theme}
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
});

import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal, Portal, Text, Button, Provider } from 'react-native-paper';

import { getTracker, useTheme, useTracker } from '@hooks/persisted';
import { Appbar, List } from '@components';
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
    <Provider>
      <Appbar
        title={getString('tracking')}
        handleGoBack={() => navigation.goBack()}
        theme={theme}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          paddingVertical: 8,
        }}
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
            tracker?.auth.expiresAt < new Date(Date.now()) && (
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
            )}
        </List.Section>

        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={{
              padding: 20,
              margin: 20,
              borderRadius: 6,
              backgroundColor: theme.overlay3,
            }}
          >
            <Text
              style={{
                color: theme.onSurface,
                fontSize: 18,
              }}
            >
              {getString('trackingScreen.logOutMessage', {
                name: tracker?.name,
              })}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                style={{ marginTop: 30 }}
                labelStyle={{
                  color: theme.primary,
                  letterSpacing: 0,
                  textTransform: 'none',
                }}
                onPress={hideModal}
              >
                {getString('common.cancel')}
              </Button>
              <Button
                style={{ marginTop: 30 }}
                labelStyle={{
                  color: theme.primary,
                  letterSpacing: 0,
                  textTransform: 'none',
                }}
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
  );
};

export default TrackerScreen;

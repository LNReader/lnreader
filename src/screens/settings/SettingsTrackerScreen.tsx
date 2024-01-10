import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal, Portal, Text, Button, Provider } from 'react-native-paper';

import { useSelector, useDispatch } from 'react-redux';
import { removeTracker, setTracker } from '@redux/tracker/tracker.actions';
import { useTheme } from '@hooks/persisted';
import { Appbar, List } from '@components';
import { getTracker } from '@services/Trackers/index';
import { TrackerSettingsScreenProps } from '@navigators/types';
import { RootState } from '@redux/store';

const TrackerScreen = ({ navigation }: TrackerSettingsScreenProps) => {
  const theme = useTheme();
  const tracker = useSelector(
    (state: RootState) => state.trackerReducer.tracker,
  );
  const dispatch = useDispatch();

  // Tracker Modal
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <Provider>
      <Appbar
        title="Tracking"
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
          <List.SubHeader theme={theme}>Services</List.SubHeader>
          <List.Item
            title="AniList"
            onPress={async () => {
              if (tracker) {
                showModal();
              } else {
                const auth = await getTracker('AniList')?.authenticate();
                if (auth) {
                  dispatch(setTracker('AniList', { auth }));
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
                const auth = await getTracker('MyAnimeList')?.authenticate();
                if (auth) {
                  dispatch(setTracker('MyAnimeList', { auth }));
                }
              }
            }}
            right={tracker?.name === 'MyAnimeList' ? 'check' : undefined}
            theme={theme}
          />
          {tracker?.name === 'MyAnimeList' &&
            tracker.expires_in < new Date(Date.now()) && (
              <>
                <List.Divider theme={theme} />
                <List.SubHeader theme={theme}>Settings</List.SubHeader>
                <List.Item
                  title="Revalidate MyAnimeList"
                  onPress={async () => {
                    const revalidate = getTracker('MyAnimeList')?.revalidate;
                    if (revalidate) {
                      const auth = revalidate(tracker.auth);
                      setTracker('MyAnimeList', { auth });
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
              Log out from {tracker?.name}?
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
                Cancel
              </Button>
              <Button
                style={{ marginTop: 30 }}
                labelStyle={{
                  color: theme.primary,
                  letterSpacing: 0,
                  textTransform: 'none',
                }}
                onPress={() => {
                  dispatch(removeTracker());
                  hideModal();
                }}
              >
                Logout
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

export default TrackerScreen;

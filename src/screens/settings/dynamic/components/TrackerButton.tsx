import React, { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Text, Button } from 'react-native-paper';

import { getTracker, useTheme, useTracker } from '@hooks/persisted';
import { List } from '@components';
import { getString } from '@strings/translations';

const TrackerButton = ({
  trackerName,
}: {
  trackerName: 'AniList' | 'MyAnimeList';
}) => {
  const theme = useTheme();
  const { tracker, removeTracker, setTracker } = useTracker();

  // Tracker Modal
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  return (
    <>
      <List.Item
        title={trackerName}
        onPress={async () => {
          if (tracker) {
            showModal();
          } else {
            const auth = await getTracker(trackerName).authenticate();
            if (auth) {
              setTracker(trackerName, auth);
            }
          }
        }}
        right={tracker?.name === trackerName ? 'check' : undefined}
        theme={theme}
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={[
            {
              backgroundColor: theme.overlay3,
            },
            styles.container,
          ]}
        >
          <Text
            style={[
              {
                color: theme.onSurface,
              },
              styles.fontSize,
            ]}
          >
            {getString('trackingScreen.logOutMessage', {
              name: tracker?.name,
            })}
          </Text>
          <View style={styles.row}>
            <Button
              style={styles.marginTop}
              labelStyle={[
                {
                  color: theme.primary,
                },
                styles.letter,
              ]}
              onPress={hideModal}
            >
              {getString('common.cancel')}
            </Button>
            <Button
              style={styles.marginTop}
              labelStyle={[
                {
                  color: theme.primary,
                },
                styles.letter,
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
    </>
  );
};
export default memo(TrackerButton);

const styles = StyleSheet.create({
  letter: {
    letterSpacing: 0,
    textTransform: 'none',
  },
  marginTop: {
    marginTop: 30,
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end' },
  fontSize: { fontSize: 18 },
  container: { padding: 20, margin: 20, borderRadius: 6 },
});

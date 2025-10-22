import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { MyAnimeListScoreSelector } from './MyAnimeList';
import { AniListScoreSelector } from './AniList';
import { MangaUpdatesScoreSelector } from './MangaUpdates';
import { Modal } from '@components';

const SetTrackScoreDialog = ({
  tracker,
  trackItem,
  trackScoreDialog,
  setTrackScoreDialog,
  updateTrackScore,
  theme,
}) => {
  return (
    <Modal
      visible={trackScoreDialog}
      onDismiss={() => setTrackScoreDialog(false)}
    >
      <Text style={[styles.dialogTitle, { color: theme.onSurface }]}>
        Score
      </Text>
      {tracker.name === 'MyAnimeList' ? (
        <MyAnimeListScoreSelector
          theme={theme}
          trackItem={trackItem}
          updateTrackScore={updateTrackScore}
        />
      ) : tracker.name === 'MangaUpdates' ? (
        <MangaUpdatesScoreSelector
          theme={theme}
          trackItem={trackItem}
          updateTrackScore={updateTrackScore}
        />
      ) : (
        <AniListScoreSelector
          theme={theme}
          trackItem={trackItem}
          auth={tracker.auth}
          updateTrackScore={updateTrackScore}
        />
      )}
    </Modal>
  );
};

export default SetTrackScoreDialog;

const styles = StyleSheet.create({
  dialogTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
});

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Modal, overlay } from 'react-native-paper';
import { MyAnimeListScoreSelector } from './MyAnimeList';
import { AniListScoreSelector } from './AniList';

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
      contentContainerStyle={[
        styles.containerStyle,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
      theme={{ colors: { backdrop: 'rgba(0,0,0,0.25)' } }}
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
  containerStyle: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
  },
  dialogTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
});

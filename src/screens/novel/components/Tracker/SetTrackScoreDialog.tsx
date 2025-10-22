import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, DialogTitle, Modal } from '@components';
import { getString } from '@strings/translations';
import {
  AniListScoreSelector,
  MangaUpdatesScoreSelector,
  MyAnimeListScoreSelector,
} from './ScoreSelectors';
import { TrackScoreDialogProps } from './types';

const SetTrackScoreDialog: React.FC<TrackScoreDialogProps> = ({
  tracker,
  trackItem,
  visible,
  onDismiss,
  onUpdateScore,
}) => {
  const [selectedScore, setSelectedScore] = useState(trackItem.score);

  useEffect(() => {
    if (visible) {
      setSelectedScore(trackItem.score);
    }
  }, [visible, trackItem.score]);

  const handleSave = () => {
    onUpdateScore(selectedScore);
    onDismiss();
  };

  const ScoreSelector = useMemo(() => {
    switch (tracker.name) {
      case 'MyAnimeList':
        return (
          <MyAnimeListScoreSelector
            trackItem={{ ...trackItem, score: selectedScore }}
            onUpdateScore={setSelectedScore}
          />
        );
      case 'MangaUpdates':
        return (
          <MangaUpdatesScoreSelector
            trackItem={{ ...trackItem, score: selectedScore }}
            onUpdateScore={setSelectedScore}
          />
        );
      case 'AniList':
      default:
        return (
          <AniListScoreSelector
            trackItem={{ ...trackItem, score: selectedScore }}
            scoreFormat={tracker.auth.meta.scoreFormat}
            onUpdateScore={setSelectedScore}
          />
        );
    }
  }, [tracker, trackItem, selectedScore]);

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <DialogTitle title="Score" />
      {ScoreSelector}
      <View style={styles.buttonContainer}>
        <Button onPress={onDismiss}>{getString('common.cancel')}</Button>
        <Button onPress={handleSave}>{getString('common.save')}</Button>
      </View>
    </Modal>
  );
};

export default SetTrackScoreDialog;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
});

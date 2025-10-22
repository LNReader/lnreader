import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, ToastAndroid, View } from 'react-native';
import { Portal, overlay } from 'react-native-paper';

import BottomSheet from '@components/BottomSheet/BottomSheet';
import { useTheme, useTracker, useTrackedNovel } from '@hooks/persisted';
import { UserListStatus } from '@services/Trackers';
import { NovelInfo } from '@database/types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { getStatusLabel, getTrackerIcon } from './constants';
import { AddTrackingCard, TrackedItemCard } from './TrackerCards';
import TrackSearchDialog from './TrackSearchDialog';
import SetTrackStatusDialog from './SetTrackStatusDialog';
import SetTrackScoreDialog from './SetTrackScoreDialog';
import SetTrackChaptersDialog from './SetTrackChaptersDialog';

interface TrackSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModalMethods | null>;
  novel: NovelInfo;
}

const TrackSheet: React.FC<TrackSheetProps> = ({ bottomSheetRef, novel }) => {
  const theme = useTheme();
  const { tracker } = useTracker();
  const { trackedNovel, trackNovel, untrackNovel, updateTrackedNovel } =
    useTrackedNovel(novel.id);

  const [trackSearchDialog, setTrackSearchDialog] = useState(false);
  const [trackStatusDialog, setTrackStatusDialog] = useState(false);
  const [trackChaptersDialog, setTrackChaptersDialog] = useState(false);
  const [trackScoreDialog, setTrackScoreDialog] = useState(false);

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, [bottomSheetRef]);

  const handleSetSearchTrackDialog = useCallback(() => {
    setTrackSearchDialog(true);
  }, [closeBottomSheet]);

  const handleSetStatusDialog = useCallback(() => {
    closeBottomSheet();
    setTrackStatusDialog(true);
  }, [closeBottomSheet]);

  const handleSetChaptersDialog = useCallback(() => {
    closeBottomSheet();
    setTrackChaptersDialog(true);
  }, [closeBottomSheet]);

  const handleSetScoreDialog = useCallback(() => {
    closeBottomSheet();
    setTrackScoreDialog(true);
  }, [closeBottomSheet]);

  const handleDismissSearchDialog = useCallback(() => {
    setTrackSearchDialog(false);
  }, []);

  const handleDismissStatusDialog = useCallback(() => {
    setTrackStatusDialog(false);
  }, []);

  const handleDismissChaptersDialog = useCallback(() => {
    setTrackChaptersDialog(false);
  }, []);

  const handleDismissScoreDialog = useCallback(() => {
    setTrackScoreDialog(false);
  }, []);

  const updateTrackChapters = useCallback(
    (newChapters: string) => {
      if (!tracker) return;

      if (!newChapters) {
        ToastAndroid.show('Enter a valid number', ToastAndroid.SHORT);
        return;
      }

      const newProgress = Number(newChapters);
      if (isNaN(newProgress)) {
        ToastAndroid.show('Enter a valid number', ToastAndroid.SHORT);
        return;
      }

      updateTrackedNovel(tracker, { progress: newProgress });
    },
    [tracker, updateTrackedNovel],
  );

  const updateTrackStatus = useCallback(
    (newStatus: UserListStatus) => {
      if (!tracker) return;
      updateTrackedNovel(tracker, { status: newStatus });
    },
    [tracker, updateTrackedNovel],
  );

  const updateTrackScore = useCallback(
    (newScore: number) => {
      if (!tracker) return;
      updateTrackedNovel(tracker, { score: newScore });
    },
    [tracker, updateTrackedNovel],
  );

  const trackerIcon = useMemo(
    () => (tracker ? getTrackerIcon(tracker.name) : null),
    [tracker],
  );

  const snapPoints = useMemo(
    () => (trackedNovel ? [180] : [130]),
    [trackedNovel],
  );

  if (!tracker || !trackerIcon) {
    return null;
  }

  return (
    <>
      <BottomSheet bottomSheetRef={bottomSheetRef} snapPoints={snapPoints}>
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: overlay(2, theme.surface) },
          ]}
        >
          {!trackedNovel ? (
            <AddTrackingCard
              icon={trackerIcon}
              onPress={handleSetSearchTrackDialog}
            />
          ) : (
            <TrackedItemCard
              onUntrack={untrackNovel}
              tracker={tracker}
              icon={trackerIcon}
              trackItem={trackedNovel}
              onSetStatus={handleSetStatusDialog}
              onSetChapters={handleSetChaptersDialog}
              onSetScore={handleSetScoreDialog}
              getStatus={getStatusLabel}
            />
          )}
        </View>
      </BottomSheet>
      <Portal>
        {trackedNovel ? (
          <>
            <SetTrackStatusDialog
              trackItem={trackedNovel}
              visible={trackStatusDialog}
              onDismiss={handleDismissStatusDialog}
              onUpdateStatus={updateTrackStatus}
            />
            <SetTrackChaptersDialog
              trackItem={trackedNovel}
              visible={trackChaptersDialog}
              onDismiss={handleDismissChaptersDialog}
              onUpdateChapters={updateTrackChapters}
            />
            <SetTrackScoreDialog
              tracker={tracker}
              trackItem={trackedNovel}
              visible={trackScoreDialog}
              onDismiss={handleDismissScoreDialog}
              onUpdateScore={updateTrackScore}
            />
          </>
        ) : (
          <TrackSearchDialog
            tracker={tracker}
            onTrackNovel={trackNovel}
            visible={trackSearchDialog}
            onDismiss={handleDismissSearchDialog}
            novelName={novel.name}
          />
        )}
      </Portal>
    </>
  );
};

export default TrackSheet;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
});

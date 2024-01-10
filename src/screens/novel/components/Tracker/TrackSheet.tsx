import React, { useState } from 'react';
import { StyleSheet, View, ToastAndroid } from 'react-native';
import { overlay, Portal } from 'react-native-paper';
import BottomSheet from '@components/BottomSheet/BottomSheet';

import TrackSearchDialog from './TrackSearchDialog';
import SetTrackStatusDialog from './SetTrackStatusDialog';
import SetTrackScoreDialog from './SetTrackScoreDialog';
import SetTrackChaptersDialog from './SetTrackChaptersDialog';
import { AddTrackingCard, TrackedItemCard } from './TrackerCards';
import { ThemeColors } from '@theme/types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useTracker, useTrackedNovel } from '@hooks/persisted';
import { UserListStatus } from '@services/Trackers';

interface Props {
  bottomSheetRef: React.Ref<BottomSheetModalMethods>;
  novelId: number;
  novelName: string;
  theme: ThemeColors;
}

const TrackSheet = ({ bottomSheetRef, novelId, novelName, theme }: Props) => {
  const { tracker } = useTracker();
  const { trackedNovel, trackNovel, untrackNovel, updateTrackedNovel } =
    useTrackedNovel(novelId);

  const [trackSearchDialog, setTrackSearchDialog] = useState(false);
  const [trackStatusDialog, setTrackStatusDialog] = useState(false);
  const [trackChaptersDialog, setTrackChaptersDialog] = useState(false);
  const [trackScoreDialog, setTrackScoreDialog] = useState(false);
  if (!tracker) {
    return null;
  }

  const getStatus = (status: string) => {
    switch (status) {
      case 'CURRENT':
        return 'Reading';
      case 'PLANNING':
        return 'Plan to read';
      case 'COMPLETED':
        return 'Completed';
      case 'DROPPED':
        return 'Dropped';
      case 'PAUSED':
        return 'On Hold';
      case 'REPEATING':
        return 'Rereading';
    }
  };

  const updateTrackChapters = (newChapters: string) => {
    if (newChapters !== '') {
      const newProgress = Number(newChapters);
      updateTrackedNovel(tracker, { progress: newProgress });

      setTrackChaptersDialog(false);
    } else {
      ToastAndroid.show('Enter a valid number', ToastAndroid.SHORT);
    }
  };

  const updateTrackStatus = (newStatus: UserListStatus) => {
    updateTrackedNovel(tracker, { status: newStatus });
    setTrackStatusDialog(false);
  };

  const updateTrackScore = (newScore: number) => {
    updateTrackedNovel(tracker, { score: newScore });
    setTrackScoreDialog(false);
  };

  return (
    <>
      <BottomSheet bottomSheetRef={bottomSheetRef} snapPoints={[130]}>
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: overlay(2, theme.surface) },
          ]}
        >
          {!trackedNovel ? (
            tracker.name === 'MyAnimeList' ? (
              <AddTrackingCard
                icon={require('../../../../../assets/mal.png')}
                theme={theme}
                setTrackSearchDialog={setTrackSearchDialog}
              />
            ) : (
              <AddTrackingCard
                icon={require('../../../../../assets/anilist.png')}
                theme={theme}
                setTrackSearchDialog={setTrackSearchDialog}
              />
            )
          ) : (
            <TrackedItemCard
              untrackNovel={untrackNovel}
              tracker={tracker}
              icon={
                tracker?.name === 'MyAnimeList'
                  ? require('../../../../../assets/mal.png')
                  : require('../../../../../assets/anilist.png')
              }
              trackItem={trackedNovel}
              setTrackStatusDialog={setTrackStatusDialog}
              setTrackChaptersDialog={setTrackChaptersDialog}
              setTrackScoreDialog={setTrackScoreDialog}
              theme={theme}
              getStatus={getStatus}
            />
          )}
        </View>
      </BottomSheet>
      <Portal>
        {trackedNovel ? (
          <>
            <SetTrackStatusDialog
              trackItem={trackedNovel}
              trackStatusDialog={trackStatusDialog}
              setTrackStatusDialog={setTrackStatusDialog}
              updateTrackStatus={updateTrackStatus}
              theme={theme}
            />
            <SetTrackChaptersDialog
              trackItem={trackedNovel}
              trackChaptersDialog={trackChaptersDialog}
              setTrackChaptersDialog={setTrackChaptersDialog}
              updateTrackChapters={updateTrackChapters}
              theme={theme}
            />
            <SetTrackScoreDialog
              tracker={tracker}
              trackItem={trackedNovel}
              trackScoreDialog={trackScoreDialog}
              setTrackScoreDialog={setTrackScoreDialog}
              updateTrackScore={updateTrackScore}
              theme={theme}
            />
          </>
        ) : (
          <TrackSearchDialog
            tracker={tracker}
            trackNovel={trackNovel}
            trackSearchDialog={trackSearchDialog}
            setTrackSearchDialog={setTrackSearchDialog}
            novelName={novelName}
            theme={theme}
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

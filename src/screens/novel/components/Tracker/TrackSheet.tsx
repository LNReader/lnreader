import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ToastAndroid } from 'react-native';
import { overlay, Portal } from 'react-native-paper';
import BottomSheet from '@components/BottomSheet/BottomSheet';

import { useDispatch } from 'react-redux';
import { useTrackerReducer } from '@redux/hooks';
import { updateTracker } from '../../../../redux/tracker/tracker.actions';

import TrackSearchDialog from './TrackSearchDialog';
import SetTrackStatusDialog from './SetTrackStatusDialog';
import SetTrackScoreDialog from './SetTrackScoreDialog';
import SetTrackChaptersDialog from './SetTrackChaptersDialog';
import { AddTrackingCard, TrackedItemCard } from './TrackerCards';
import { ThemeColors } from '@theme/types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useTracker } from '@hooks/persisted';

interface Props {
  bottomSheetRef: React.Ref<BottomSheetModalMethods>;
  novelId: number;
  novelName: string;
  theme: ThemeColors;
}

const TrackSheet = ({ bottomSheetRef, novelId, novelName, theme }: Props) => {
  const { trackedNovels } = useTrackerReducer();
  const { tracker } = useTracker();
  const dispatch = useDispatch();

  const [trackItem, setTrackItem] = useState();

  useEffect(() => {
    setTrackItem(trackedNovels.find(obj => obj.novelId === novelId));
  }, [trackedNovels, novelId]);

  const [trackSearchDialog, setTrackSearchDialog] = useState(false);
  const [trackStatusDialog, setTrackStatusDialog] = useState(false);
  const [trackChaptersDialog, setTrackChaptersDialog] = useState(false);
  const [trackScoreDialog, setTrackScoreDialog] = useState(false);

  /** @type {(status: import("../../../../services/Trackers/index").UserListStatus) => string} */
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
      setTrackItem({
        ...trackItem,
        userData: {
          ...trackItem.userData,
          progress: newProgress,
        },
      });

      dispatch(
        updateTracker(tracker?.name, trackItem.id, tracker.auth, {
          ...trackItem.userData,
          progress: newProgress,
        }),
      );

      setTrackChaptersDialog(false);
    } else {
      ToastAndroid.show('Enter a valid number', ToastAndroid.SHORT);
    }
  };

  const updateTrackStatus = (newStatus: string) => {
    setTrackItem({
      ...trackItem,
      userData: {
        ...trackItem.userData,
        status: newStatus,
      },
    });

    dispatch(
      updateTracker(tracker?.name, trackItem.id, trackItem, tracker.auth, {
        ...trackItem.userData,
        status: newStatus,
      }),
    );

    setTrackStatusDialog(false);
  };

  const updateTrackScore = (newScore: number) => {
    setTrackItem({
      ...trackItem,
      userData: {
        ...trackItem.userData,
        score: newScore,
      },
    });

    dispatch(
      updateTracker(tracker?.name, trackItem.id, tracker.auth, {
        ...trackItem.userData,
        score: newScore,
      }),
    );

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
          {!trackItem ? (
            tracker?.name === 'MyAnimeList' ? (
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
              tracker={tracker}
              icon={
                tracker?.name === 'MyAnimeList'
                  ? require('../../../../../assets/mal.png')
                  : require('../../../../../assets/anilist.png')
              }
              trackItem={trackItem}
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
        {trackItem ? (
          <>
            <SetTrackStatusDialog
              trackItem={trackItem}
              trackStatusDialog={trackStatusDialog}
              setTrackStatusDialog={setTrackStatusDialog}
              updateTrackStatus={updateTrackStatus}
              theme={theme}
            />
            <SetTrackChaptersDialog
              trackItem={trackItem}
              trackChaptersDialog={trackChaptersDialog}
              setTrackChaptersDialog={setTrackChaptersDialog}
              updateTrackChapters={updateTrackChapters}
              theme={theme}
            />
            <SetTrackScoreDialog
              tracker={tracker}
              trackItem={trackItem}
              trackScoreDialog={trackScoreDialog}
              setTrackScoreDialog={setTrackScoreDialog}
              updateTrackScore={updateTrackScore}
              theme={theme}
            />
          </>
        ) : (
          <TrackSearchDialog
            tracker={tracker}
            trackSearchDialog={trackSearchDialog}
            setTrackSearchDialog={setTrackSearchDialog}
            novelId={novelId}
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

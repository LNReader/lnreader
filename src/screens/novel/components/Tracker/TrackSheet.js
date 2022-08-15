import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ToastAndroid } from 'react-native';
import { overlay, Portal } from 'react-native-paper';
import Bottomsheet from 'rn-sliding-up-panel';

import { useSelector, useDispatch } from 'react-redux';
import { updateTracker } from '../../../../redux/tracker/tracker.actions';

import TrackSearchDialog from './TrackSearchDialog';
import SetTrackStatusDialog from './SetTrackStatusDialog';
import SetTrackScoreDialog from './SetTrackScoreDialog';
import SetTrackChaptersDialog from './SetTrackChaptersDialog';
import { AddMalTrackingCard, MalTrackItemCard } from './MyAnimeListCards';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TrackSheet = ({ bottomSheetRef, novelId, novelName, theme }) => {
  const tracker = useSelector(state => state.trackerReducer.tracker);
  const trackedNovels = useSelector(
    state => state.trackerReducer.trackedNovels,
  );
  const dispatch = useDispatch();

  const { bottom } = useSafeAreaInsets();

  const [trackItem, setTrackItem] = useState();

  useEffect(() => {
    setTrackItem(trackedNovels.find(obj => obj.novelId === novelId));
  }, [trackedNovels, novelId]);

  const [trackSearchDialog, setTrackSearchDialog] = useState(false);
  const [trackStatusDialog, setTrackStatusDialog] = useState(false);
  const [trackChaptersDialog, setTrackChaptersDialog] = useState(false);
  const [trackScoreDialog, setTrackScoreDialog] = useState(false);

  const getStatus = status => {
    const myAnimeListStatus = {
      reading: 'Reading',
      completed: 'Completed',
      on_hold: 'On Hold',
      dropped: 'Dropped',
      plan_to_read: 'Plan to read',
    };

    return myAnimeListStatus[status];
  };

  const updateTrackChapters = newChapters => {
    if (newChapters !== '') {
      setTrackItem({
        ...trackItem,
        my_list_status: {
          ...trackItem.my_list_status,
          num_chapters_read: newChapters,
        },
      });

      dispatch(
        updateTracker(trackItem.id, tracker.access_token, {
          ...trackItem.my_list_status,
          num_chapters_read: newChapters,
        }),
      );

      setTrackChaptersDialog(false);
    } else {
      ToastAndroid.show('Enter a valid number', ToastAndroid.SHORT);
    }
  };

  const updateTrackStatus = newStatus => {
    setTrackItem({
      ...trackItem,
      my_list_status: {
        ...trackItem.my_list_status,
        status: newStatus,
      },
    });

    dispatch(
      updateTracker(trackItem.id, tracker.access_token, {
        ...trackItem.my_list_status,
        status: newStatus,
      }),
    );

    setTrackStatusDialog(false);
  };

  const updateTrackScore = newScore => {
    setTrackItem({
      ...trackItem,
      my_list_status: {
        ...trackItem.my_list_status,
        score: newScore,
      },
    });

    dispatch(
      updateTracker(trackItem.id, tracker.access_token, {
        ...trackItem.my_list_status,
        score: newScore,
      }),
    );

    setTrackScoreDialog(false);
  };

  const bottomSheetHeight = 120 + bottom;

  return (
    <>
      <Bottomsheet
        ref={bottomSheetRef}
        draggableRange={{ top: bottomSheetHeight, bottom: 0 }}
        snappingPoints={[0, bottomSheetHeight]}
        backdropOpacity={0.25}
      >
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: overlay(2, theme.surface) },
          ]}
        >
          {!trackItem ? (
            <AddMalTrackingCard
              theme={theme}
              setTrackSearchDialog={setTrackSearchDialog}
            />
          ) : (
            <MalTrackItemCard
              trackItem={trackItem}
              setTrackStatusDialog={setTrackStatusDialog}
              setTrackChaptersDialog={setTrackChaptersDialog}
              setTrackScoreDialog={setTrackScoreDialog}
              theme={theme}
              getStatus={getStatus}
            />
          )}
        </View>
      </Bottomsheet>
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
              trackItem={trackItem}
              trackScoreDialog={trackScoreDialog}
              setTrackScoreDialog={setTrackScoreDialog}
              updateTrackScore={updateTrackScore}
              theme={theme}
            />
          </>
        ) : (
          <TrackSearchDialog
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

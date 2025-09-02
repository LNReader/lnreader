import { SearchResult, UserListEntry } from '@services/Trackers';
import { useCallback } from 'react';
import { useMMKVObject } from 'react-native-mmkv';
import { TrackerMetadata, getTracker } from '../useTracker';
import { TRACKED_NOVEL_PREFIX } from '@utils/constants/mmkv';

type TrackedNovel = SearchResult & UserListEntry;

export const useTrackedNovel = (novelId: number | 'NO_ID') => {
  const [trackedNovel, setValue] = useMMKVObject<TrackedNovel>(
    `${TRACKED_NOVEL_PREFIX}_${novelId}`,
  );
  const updateNovelProgess = useCallback(
    (tracker: TrackerMetadata, chaptersRead: number) => {
      if (!trackedNovel || novelId === 'NO_ID') {
        return;
      }
      return getTracker(tracker.name).updateUserListEntry(
        trackedNovel.id,
        { progress: chaptersRead },
        tracker.auth,
      );
    },
    [novelId, trackedNovel],
  );
  if (novelId === 'NO_ID') {
    return {
      trackedNovel: undefined,
      trackNovel: () => {},
      untrackNovel: () => {},
      updateTrackedNovel: () => {},
      updateNovelProgess: () => {},
    };
  }

  // #endregion
  // #region trackNovel functions

  const trackNovel = (tracker: TrackerMetadata, novel: SearchResult) => {
    getTracker(tracker.name)
      .getUserListEntry(novel.id, tracker.auth)
      .then((data: UserListEntry) => {
        setValue({
          ...novel,
          ...data,
        });
      });
  };

  const untrackNovel = () => setValue(undefined);

  const updateTrackedNovel = (
    tracker: TrackerMetadata,
    data: Partial<UserListEntry>,
  ) => {
    if (!trackedNovel) {
      return;
    }
    return getTracker(tracker.name).updateUserListEntry(
      trackedNovel.id,
      data,
      tracker.auth,
    );
  };

  return {
    trackedNovel,
    trackNovel,
    untrackNovel,
    updateTrackedNovel,
    updateNovelProgess,
  };
};

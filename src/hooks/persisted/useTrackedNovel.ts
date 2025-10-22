import { useCallback } from 'react';
import { useMMKVObject } from 'react-native-mmkv';
import { SearchResult, UserListEntry } from '@services/Trackers';
import { TrackerMetadata, getTracker } from './useTracker';

export const TRACKED_NOVEL_PREFIX = 'TRACKED_NOVEL_PREFIX';

type TrackedNovel = SearchResult & UserListEntry;

export const useTrackedNovel = (novelId: number | 'NO_ID') => {
  const [trackedNovel, setValue] = useMMKVObject<TrackedNovel>(
    `${TRACKED_NOVEL_PREFIX}_${novelId}`,
  );

  const updateNovelProgess = useCallback(
    async (tracker: TrackerMetadata, chaptersRead: number) => {
      if (!trackedNovel || novelId === 'NO_ID') {
        return;
      }

      await getTracker(tracker.name)
        .updateUserListEntry(
          trackedNovel.id,
          { progress: chaptersRead },
          tracker.auth,
        )
        .then((res: UserListEntry) => {
          setValue({
            ...trackedNovel,
            progress: res.progress,
            score: res.score,
            status: res.status,
          });
        });
    },
    [novelId, trackedNovel, setValue],
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

    return getTracker(tracker.name)
      .updateUserListEntry(trackedNovel.id, data, tracker.auth)
      .then((res: UserListEntry) => {
        setValue({
          ...trackedNovel,
          progress: res.progress,
          score: res.score,
          status: res.status,
        });
      });
  };

  return {
    trackedNovel,
    trackNovel,
    untrackNovel,
    updateTrackedNovel,
    updateNovelProgess,
  };
};

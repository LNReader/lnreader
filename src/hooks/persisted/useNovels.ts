import { SearchResult, UserListEntry } from '@services/Trackers';
import { useMMKVObject } from 'react-native-mmkv';
import { TrackerMetadata, getTracker } from './useTracker';

// novel is stored by key: NOVEL_PREFIX + '_' + novel.id,
export const NOVEL_PREFIX = 'NOVEL_PREFIX';
export const TRACKED_NOVEL_PREFIX = 'TRACKED_NOVEL_PREFIX';

type TrackedNovel = SearchResult & UserListEntry;

export const useTrackedNovel = (id: number) => {
  const [trackedNovel, setValue] = useMMKVObject<TrackedNovel>(
    TRACKED_NOVEL_PREFIX + '_' + id,
  );

  const trackNovel = (tracker: TrackerMetadata, novel: SearchResult) => {
    getTracker(tracker.name)
      .getUserListEntry(novel.id, tracker.auth)
      .then((data: UserListEntry) => {
        console.log(data);

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

  const updateNovelProgess = (
    tracker: TrackerMetadata,
    chaptersRead: number,
  ) => {
    if (!trackedNovel) {
      return;
    }
    return getTracker(tracker.name).updateUserListEntry(
      trackedNovel.id,
      { progress: chaptersRead },
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

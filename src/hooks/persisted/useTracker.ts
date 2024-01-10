import { AuthenticationResult, Tracker, TrackerName } from '@services/Trackers';
import { aniListTracker } from '@services/Trackers/aniList';
import { myAnimeListTracker } from '@services/Trackers/myAnimeList';
import { useMMKVObject } from 'react-native-mmkv';

export const TRACKER = 'TRACKER';
export const TRACKED_NOVELS = 'TRACKED_NOVELS';

export type TrackerMetadata = {
  name: TrackerName;
  auth: AuthenticationResult<any>;
};

const trackers: Record<TrackerName, Tracker> = {
  AniList: aniListTracker,
  MyAnimeList: myAnimeListTracker,
};

export const getTracker = (name: TrackerName) => {
  return trackers[name];
};

export function useTracker() {
  const [tracker, setValue] = useMMKVObject<TrackerMetadata>(TRACKER);
  const setTracker = (name: TrackerName, auth: AuthenticationResult<any>) =>
    setValue({ name, auth });
  const removeTracker = () => setValue(undefined);
  return {
    tracker,
    setTracker,
    removeTracker,
  };
}

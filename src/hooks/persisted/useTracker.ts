import { AuthenticationResult, Tracker, TrackerName } from '@services/Trackers';
import { aniListTracker } from '@services/Trackers/aniList';
import { myAnimeListTracker } from '@services/Trackers/myAnimeList';
import { mangaUpdatesTracker } from '@services/Trackers/mangaUpdates';
import { useMMKVObject, useMMKVString } from 'react-native-mmkv';
import { useEffect } from 'react';
import {
  migrateTrackerAuth,
  OLD_TRACKER_KEY,
  TRACKER_MIGRATION_V1_KEY,
} from './migrations/trackerMigration';

export const TRACKERS = 'TRACKERS';
export const ACTIVE_TRACKER = 'ACTIVE_TRACKER';
export const TRACKED_NOVELS = 'TRACKED_NOVELS';

export type TrackerMetadata = {
  name: TrackerName;
  auth: AuthenticationResult<any>;
};

const trackers: Record<TrackerName, Tracker> = {
  AniList: aniListTracker,
  MyAnimeList: myAnimeListTracker,
  MangaUpdates: mangaUpdatesTracker,
};

export const getTracker = (name: TrackerName) => {
  return trackers[name];
};

export const getAllTrackerNames = (): TrackerName[] => {
  return Object.keys(trackers) as TrackerName[];
};

export function useTracker() {
  const [oldTracker, setOldTracker] =
    useMMKVObject<TrackerMetadata>(OLD_TRACKER_KEY);
  const [authenticatedTrackers, setAuthenticatedTrackers] =
    useMMKVObject<Partial<Record<TrackerName, TrackerMetadata>>>(TRACKERS);
  const [activeTrackerName, setActiveTrackerName] =
    useMMKVString(ACTIVE_TRACKER);
  const [migrationCompleted, setMigrationCompleted] = useMMKVString(
    TRACKER_MIGRATION_V1_KEY,
  );

  useEffect(() => {
    if (migrationCompleted === 'true') {
      return;
    }

    if (oldTracker) {
      const migratedTrackers = migrateTrackerAuth(
        oldTracker,
        authenticatedTrackers,
      );
      setAuthenticatedTrackers(migratedTrackers);
      setActiveTrackerName(oldTracker.name);
      setOldTracker(undefined);
      setMigrationCompleted('true');
    } else {
      setMigrationCompleted('true');
    }
  }, [
    oldTracker,
    authenticatedTrackers,
    migrationCompleted,
    setAuthenticatedTrackers,
    setActiveTrackerName,
    setOldTracker,
    setMigrationCompleted,
  ]);

  const tracker =
    activeTrackerName &&
    authenticatedTrackers?.[activeTrackerName as TrackerName]
      ? authenticatedTrackers[activeTrackerName as TrackerName]
      : undefined;

  const setTracker = (name: TrackerName, auth: AuthenticationResult<any>) => {
    const updated: Partial<Record<TrackerName, TrackerMetadata>> = {
      ...(authenticatedTrackers || {}),
      [name]: { name, auth },
    };
    setAuthenticatedTrackers(updated);
    setActiveTrackerName(name);
  };

  const removeTracker = (name?: TrackerName) => {
    if (!name) {
      if (activeTrackerName && authenticatedTrackers) {
        const newTrackers = { ...authenticatedTrackers };
        delete newTrackers[activeTrackerName as TrackerName];
        setAuthenticatedTrackers(
          Object.keys(newTrackers).length > 0 ? newTrackers : undefined,
        );
        setActiveTrackerName(undefined);
      }
      return;
    }

    if (authenticatedTrackers) {
      const newTrackers = { ...authenticatedTrackers };
      delete newTrackers[name];
      setAuthenticatedTrackers(
        Object.keys(newTrackers).length > 0 ? newTrackers : undefined,
      );

      if (activeTrackerName === name) {
        const remainingTrackers = Object.keys(newTrackers) as TrackerName[];
        setActiveTrackerName(
          remainingTrackers.length > 0 ? remainingTrackers[0] : undefined,
        );
      }
    }
  };

  const setActiveTracker = (name: TrackerName | undefined) => {
    if (!name) {
      setActiveTrackerName(undefined);
      return;
    }

    if (authenticatedTrackers?.[name]) {
      setActiveTrackerName(name);
    }
  };

  const getTrackerAuth = (name: TrackerName): TrackerMetadata | undefined => {
    return authenticatedTrackers?.[name];
  };

  const isTrackerAuthenticated = (name: TrackerName): boolean => {
    return !!authenticatedTrackers?.[name];
  };

  const getAuthenticatedTrackers = (): TrackerMetadata[] => {
    return authenticatedTrackers ? Object.values(authenticatedTrackers) : [];
  };

  return {
    tracker,
    setTracker,
    removeTracker,
    authenticatedTrackers: (authenticatedTrackers || {}) as Partial<
      Record<TrackerName, TrackerMetadata>
    >,
    activeTrackerName,
    setActiveTracker,
    getTrackerAuth,
    isTrackerAuthenticated,
    getAuthenticatedTrackers,
  };
}

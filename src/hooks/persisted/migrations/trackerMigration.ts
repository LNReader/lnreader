/**
 * Tracker Migration - Version 1
 * Date: October 2025
 *
 * Migrates from single-tracker format to multi-tracker format.
 *
 * Old format (pre-v1):
 *   TRACKER -> {name: "AniList", auth: {...}}
 *   TRACKED_NOVEL_PREFIX_{novelId} -> {id: 456, status: "CURRENT", ...}
 *
 * New format (v1+):
 *   TRACKERS -> {AniList: {...}, MyAnimeList: {...}, MangaUpdates: {...}}
 *   TRACKED_NOVEL_PREFIX_{novelId}_{trackerName} -> {...}
 *
 * This migration:
 * 1. Converts old single tracker auth to new multi-tracker format
 * 2. Deletes old tracker data after successful migration
 * 3. Sets migration flag to prevent re-running
 */

import { TrackerName } from '@services/Trackers';
import { TrackerMetadata } from '../useTracker';

export const TRACKER_MIGRATION_V1_KEY = 'TRACKER_MIGRATION_V1_COMPLETED';
export const OLD_TRACKER_KEY = 'TRACKER';
export const OLD_TRACKED_NOVEL_PREFIX = 'TRACKED_NOVEL_PREFIX';

export function migrateTrackerAuth(
  oldTracker: TrackerMetadata | undefined,
  currentTrackers: Partial<Record<TrackerName, TrackerMetadata>> | undefined,
): Partial<Record<TrackerName, TrackerMetadata>> | undefined {
  if (!oldTracker) {
    return currentTrackers;
  }

  const migratedTrackers: Partial<Record<TrackerName, TrackerMetadata>> =
    currentTrackers || {};
  migratedTrackers[oldTracker.name] = oldTracker;

  return migratedTrackers;
}

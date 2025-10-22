import { ImageSourcePropType } from 'react-native';

import { TrackerName, UserListStatus } from '@services/Trackers';
import { ScoreFormat, ScoreFormatting } from './types';

export const TRACKER_ICONS: Record<TrackerName, ImageSourcePropType> = {
  MyAnimeList: require('../../../../../assets/mal.png'),
  MangaUpdates: require('../../../../../assets/mangaupdates.png'),
  AniList: require('../../../../../assets/anilist.png'),
};

export const STATUS_LABELS: Record<UserListStatus, string> = {
  CURRENT: 'Reading',
  PLANNING: 'Plan to read',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
  PAUSED: 'On Hold',
  REPEATING: 'Rereading',
};

export const MYANIMELIST_SCORES: Record<number, string> = {
  0: 'No Score',
  1: 'Apalling',
  2: 'Horrible',
  3: 'Very Bad',
  4: 'Bad',
  5: 'Average',
  6: 'Fine',
  7: 'Good',
  8: 'Very Good',
  9: 'Great',
  10: 'Masterpiece',
};

export const getTrackerIcon = (trackerName: TrackerName): ImageSourcePropType =>
  TRACKER_ICONS[trackerName];

export const getStatusLabel = (status: string): string | undefined =>
  STATUS_LABELS[status as UserListStatus];

export const getMyAnimeListScoreLabel = (score: number): string =>
  `(${score}) ${MYANIMELIST_SCORES[score]}`;

export const getAniListScoreFormatting = (
  scoreFormat: ScoreFormat,
  shorten?: boolean,
): ScoreFormatting => {
  switch (scoreFormat) {
    case 'POINT_100':
      return {
        count: 101,
        label: score => (score ? score.toLocaleString() : '-'),
      };
    case 'POINT_10_DECIMAL':
      return {
        count: 101,
        label: score => (score ? (score / 10).toLocaleString() : '-'),
      };
    case 'POINT_10':
      return {
        count: 11,
        label: score => (score ? score.toLocaleString() : '-'),
      };
    case 'POINT_5':
      return {
        count: 6,
        label: score => {
          if (shorten) {
            return score ? `${score}★` : '-';
          }
          return '★'.repeat(score) || '-';
        },
      };
    case 'POINT_3':
      return {
        count: 4,
        label: score => {
          switch (score) {
            case 0:
              return '-';
            case 1:
              return '☹️';
            case 2:
              return '😐';
            case 3:
              return '😃';
            default:
              return '-';
          }
        },
      };
  }
};

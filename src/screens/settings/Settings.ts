import GeneralSettings from './settingsGroups/generalSettingsGroup';
import AppearanceSettings from './settingsGroups/appearanceSettingsGroup';
import ReaderSettings from './settingsGroups/readerSettingsGroup';
import RepoSettings from './settingsGroups/repoSettingsGroup';
import type { Settings } from './Settings.d';
import TrackerSettings from './settingsGroups/trackerSettingsGroup';
import {
  AppDefaultSettings,
  AppSettings,
  BrowseDefaultSettings,
  BrowseSettings,
  ChapterGeneralDefaultSettings,
  ChapterGeneralSettings,
  ChapterReaderDefaultSettings,
  ChapterReaderSettings,
  LibraryDefaultSettings,
  LibrarySettings,
} from './constants/defaultValues';

const settings: Settings = {
  general: GeneralSettings,
  appearance: AppearanceSettings,
  reader: ReaderSettings,
  repo: RepoSettings,
  tracker: TrackerSettings,
} as const;
export default settings;

export const defaultAppSettings: AppSettings = AppDefaultSettings;
export const defaultBrowseSettings: BrowseSettings = BrowseDefaultSettings;
export const defaultLibrarySettings: LibrarySettings = LibraryDefaultSettings;
export const defaultChapterGeneralSettings: ChapterGeneralSettings =
  ChapterGeneralDefaultSettings;
export const defaultChapterReaderSettings: ChapterReaderSettings =
  ChapterReaderDefaultSettings;

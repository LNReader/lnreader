import GeneralSettings from './settingsGroups/generalSettingsGroup';
import AppearanceSettings from './settingsGroups/appearanceSettingsGroup';
import ReaderSettings from './settingsGroups/readerSettingsGroup';
import RepoSettings from './settingsGroups/repoSettingsGroup';
import TrackerSettings from './settingsGroups/trackerSettingsGroup';
import {
  defaultSettings as de,
  DefaultSettings,
} from './constants/defaultValues';
import { Settings } from './Settings.d';

export * from './Settings.d';

const SETTINGS: Settings = {
  general: GeneralSettings,
  appearance: AppearanceSettings,
  reader: ReaderSettings,
  repo: RepoSettings,
  tracker: TrackerSettings,
} as const;
export default SETTINGS;

export const DEFAULTSETTINGS: DefaultSettings = de;

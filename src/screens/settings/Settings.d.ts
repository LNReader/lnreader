import type { FilteredSettings, ReaderTheme } from './constants/defaultValues';
import type { ThemeColors } from '@theme/types';
import type { MaterialDesignIconName } from '@type/icon';
import InfoItem from './dynamic/components/InfoItem';

type settingsGroupTypes =
  | 'GeneralSettings'
  | 'ReaderSettings'
  | 'TrackerSettings'
  | 'BackupSettings'
  | 'AppearanceSettings'
  | 'AdvancedSettings'
  | 'LibrarySettings'
  | 'RespositorySettings'
  | undefined;

export type SettingsTypeModes = 'single' | 'multiple' | 'order';

export type SettingOrigin = 'lastUpdateTime' | 'MMKV';

export type ModalSettingsType =
  | {
      mode: 'single';
      valueKey: FilteredSettings<number>;
      description?: (value: number) => string;
      options: Array<{
        label: string;
        value: number;
      }>;
    }
  | {
      mode: 'multiple';
      valueKey?: never;
      description?: (value: Array<boolean>) => string;
      options: Array<{
        label: string;
        key: FilteredSettings<boolean>;
      }>;
    }
  | {
      mode: 'order';
      valueKey: FilteredSettings;
      description?: (value: string) => string;
      options: Array<{
        label: string;
        ASC: string;
        DESC: string;
      }>;
    };

export type ModalSetting = ModalSettingsType & {
  title: string;
  type: 'Modal';
};
export type _SwitchSetting<T extends SettingOrigin | undefined = undefined> = {
  title: string;
  description?: string;
  type: 'Switch';
  settingsOrigin?: T;
  valueKey: T extends undefined ? FilteredSettings<boolean> : undefined;
  dependents?: Array<SettingsItem>;
};
export type SwitchSetting =
  | _SwitchSetting<'lastUpdateTime'>
  | _SwitchSetting<undefined>;

export type NumberInputSetting = {
  title: string;
  description?: string;
  type: 'NumberInput';
  valueKey: FilteredSettings<number>;
};

export type TextAreaSetting = {
  title: string;
  placeholder?: string;
  description?: string;
  openFileLabel: string;
  clearDialog: string;
  type: 'TextArea';
  valueKey: FilteredSettings<string>;
};

export type ThemePickerSetting = {
  title: string;
  type: 'ThemePicker';
  options: Array<ThemeColors>;
};

type _ColorPickerSetting<T extends SettingOrigin | undefined = undefined> = {
  title: string;
  description?: (val: string) => string;
  type: 'ColorPicker';
  settingsOrigin?: T;
  valueKey: T extends undefined ? keyof ReaderTheme : undefined;
};
export type ColorPickerSetting =
  | _ColorPickerSetting<'MMKV'>
  | _ColorPickerSetting<undefined>;

export type ReaderThemeSetting = { type: 'ReaderTheme' };
export type ReaderTTSSetting = { type: 'TTS' };
export type TrackerSetting = {
  type: 'Tracker';
  trackerName: 'AniList' | 'MyAnimeList';
};
export type InfoItem = { type: 'InfoItem'; title: string };

export type BaseSetting = {
  quickSettings?: boolean;
};

export type SettingsItem = BaseSetting &
  (
    | ModalSetting
    | SwitchSetting
    | ThemePickerSetting
    | ColorPickerSetting
    | NumberInputSetting
    | TextAreaSetting
    | ReaderThemeSetting
    | ReaderTTSSetting
    | TrackerSetting
    | InfoItem
  );

export type QuickSettingsItem = { quickSettings: true } & SettingsItem;

export interface SettingSubGroup<T extends string> {
  subGroupTitle: string;
  id: T;
  settings: Array<SettingsItem>;
}

export interface SettingsGroup<T extends string> {
  groupTitle: string;
  icon: MaterialDesignIconName;
  navigateParam: settingsGroupTypes;
  subGroup: SettingSubGroup<T>[];
}

type generalIds =
  | 'display'
  | 'library'
  | 'novel'
  | 'globalUpdate'
  | 'autoDownload'
  | 'general';
type appearanceIds = 'appTheme' | 'novelInfo' | 'navbar';
type readerIds = 'readerTheme' | 'tts' | 'general' | 'autoScroll' | 'display';
type repoIds = '';
type trackerIds = 'services';
export interface Settings {
  general: SettingsGroup<generalIds>;
  appearance: SettingsGroup<appearanceIds>;
  reader: SettingsGroup<readerIds>;
  tracker: SettingsGroup<trackerIds>;
}

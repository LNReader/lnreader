import { ChapterInfo, NovelInfo } from '@database/types';
import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

export type RootStackParamList = {
  BottomNavigator: undefined;
  Novel: { name: string; url: string; pluginId: string };
  Chapter: {
    novel: NovelInfo;
    chapter: ChapterInfo;
  };
  MoreStack: NavigatorScreenParams<MoreStackParamList>;
  SourceScreen: {
    pluginId: string;
    pluginName: string;
    pluginUrl: string;
    showLatestNovels: boolean;
  };
  BrowseMal: undefined;
  BrowseSettings: undefined;
  GlobalSearchScreen: { searchText?: string };
  Migration: undefined;
  SourceNovels: { pluginId: string };
  MigrateNovel: { pluginId: string; novel: any };
  WebviewScreen: {
    pluginId: string;
    name: string;
    url: string;
  };
};

export type BottomNavigatorParamList = {
  library: undefined;
  updates: undefined;
  history: undefined;
  browse: undefined;
  more: undefined;
};

export type MoreStackParamList = {
  SettingsStack: undefined;
  About: undefined;
  DownloadQueue: undefined;
  Downloads: undefined;
  Categories: undefined;
  Statistics: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  GeneralSettings: undefined;
  ReaderSettings: undefined;
  TrackerSettings: undefined;
  BackupSettings: undefined;
  AppearanceSettings: undefined;
  AdvancedSettings: undefined;
  LibrarySettings: undefined;
};

export type NovelScreenProps = StackScreenProps<RootStackParamList, 'Novel'>;
export type ChapterScreenProps = StackScreenProps<
  RootStackParamList,
  'Chapter'
>;
export type MoreStackScreenProps = StackScreenProps<
  RootStackParamList,
  'MoreStack'
>;
export type AboutScreenProps = StackScreenProps<MoreStackParamList, 'About'>;
export type BrowseSourceScreenProps = StackScreenProps<
  RootStackParamList,
  'SourceScreen'
>;
export type BrowseSettingsScreenProp = StackScreenProps<
  RootStackParamList,
  'BrowseSettings'
>;
export type GlobalSearchScreenProps = StackScreenProps<
  RootStackParamList,
  'GlobalSearchScreen'
>;
export type WebviewScreenProps = StackScreenProps<
  RootStackParamList,
  'WebviewScreen'
>;

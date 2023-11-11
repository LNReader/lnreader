import { ChapterInfo, NovelInfo } from '@database/types';
import { MaterialBottomTabScreenProps } from '@react-navigation/material-bottom-tabs';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

export type RootStackParamList = {
  BottomNavigator: NavigatorScreenParams<BottomNavigatorParamList>;
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
    showLatestNovels?: boolean;
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
  Library: undefined;
  Updates: undefined;
  History: undefined;
  Browse: undefined;
  More: undefined;
};

export type BrowseScreenProps = MaterialBottomTabScreenProps<
  BottomNavigatorParamList,
  'Browse'
>;
export type MoreStackScreenProps = CompositeScreenProps<
  MaterialBottomTabScreenProps<BottomNavigatorParamList, 'More'>,
  StackScreenProps<RootStackParamList, 'MoreStack'>
>;
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

export type AboutScreenProps = StackScreenProps<MoreStackParamList, 'About'>;
export type DownloadsScreenProps = StackScreenProps<
  MoreStackParamList,
  'Downloads'
>;
export type DownloadQueueScreenProps = StackScreenProps<
  MoreStackParamList,
  'DownloadQueue'
>;
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

import { ChapterInfo } from '@database/types';
import { StackScreenProps } from '@react-navigation/stack';

export type RootStackParamList = {
  BottomNavigator: undefined;
  Novel: { name: string; url: string; pluginId: string };
  Chapter: {
    novel: {
      id: string;
      pluginId: string;
      name: string;
    };
    chapter: ChapterInfo;
  };
  MoreStack: undefined;
  SourceScreen: {
    pluginId: string;
    pluginName: string;
    pluginUrl: string;
    showLatestNovels: boolean;
  };
  BrowseMal: undefined;
  BrowseSettings: undefined;
  GlobalSearchScreen: { searchText: string } | undefined;
  Migration: undefined;
  SourceNovels: { pluginId: string };
  MigrateNovel: { pluginId: string; novel: any };
  WebviewScreen: {
    pluginId: string;
    name: string;
    url: string;
  };
};

export type ChapterScreenProps = StackScreenProps<
  RootStackParamList,
  'Chapter'
>;
export type BrowseSourceScreenProps = StackScreenProps<
  RootStackParamList,
  'SourceScreen'
>;
export type WebviewScreenProps = StackScreenProps<
  RootStackParamList,
  'WebviewScreen'
>;

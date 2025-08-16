import React, { useMemo, useCallback } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  NavigationState,
  SceneRendererProps,
  TabBar,
  TabView,
} from 'react-native-tab-view';
import Color from 'color';

import { ThemeColors } from '@theme/types';
import { Row } from '@components/Common';
import { LibraryView } from './LibraryListView';
import SourceScreenSkeletonLoading from '@screens/browse/loadingAnimation/SourceScreenSkeletonLoading';
import { NovelInfo } from '@database/types';
import { Button } from '@components';
import { getString } from '@strings/translations';
import { ExtendedCategory } from '@hooks/persisted/library';

interface LibraryTabsProps {
  categories: ExtendedCategory[];
  index: number;
  setIndex: (index: number) => void;
  showNumberOfNovels?: boolean;
  library: NovelInfo[];
  searchText: string;
  isLoading: boolean;
  selectedNovelIds: number[];
  setSelectedNovelIds: React.Dispatch<React.SetStateAction<number[]>>;
  pickAndImport: () => void;
  navigation: any;
  theme: ThemeColors;
}

type TabViewLabelProps = {
  route: {
    id: number;
    name: string;
    sort: number;
    novelIds: number[];
    key: string;
    title: string;
  };
  labelText?: string;
  focused: boolean;
  color: string;
  allowFontScaling?: boolean;
  style?: StyleProp<TextStyle>;
};

const LibraryTabs: React.FC<LibraryTabsProps> = ({
  categories,
  index,
  setIndex,
  showNumberOfNovels,
  library,
  searchText,
  isLoading,
  selectedNovelIds,
  setSelectedNovelIds,
  pickAndImport,
  navigation,
  theme,
}) => {
  const layout = useWindowDimensions();
  const styles = useMemo(() => createTabStyles(theme), [theme]); // Memoize styles

  const renderTabBar = useCallback(
    (
      props: SceneRendererProps & {
        navigationState: NavigationState<{ key: string; title: string }>;
      },
    ) => {
      return categories.length ? (
        <TabBar
          {...props}
          scrollEnabled
          indicatorStyle={styles.tabBarIndicator}
          style={[
            {
              backgroundColor: theme.surface,
              borderBottomColor: Color(theme.isDark ? '#FFFFFF' : '#000000')
                .alpha(0.12)
                .string(),
            },
            styles.tabBar,
          ]}
          tabStyle={styles.tabStyle}
          gap={8}
          inactiveColor={theme.secondary}
          activeColor={theme.primary}
          android_ripple={{ color: theme.rippleColor }}
        />
      ) : null;
    },
    [
      categories.length,
      styles.tabBar,
      styles.tabBarIndicator,
      styles.tabStyle,
      theme.isDark,
      theme.primary,
      theme.rippleColor,
      theme.secondary,
      theme.surface,
    ],
  );

  const renderScene = useCallback(
    ({
      route,
    }: {
      route: {
        id: number;
        name: string;
        sort: number;
        novelIds: number[];
        key: string;
        title: string;
      };
    }) => {
      const ids = route.novelIds;
      const unfilteredNovels = library.filter(l => ids.includes(l.id));

      const novels = unfilteredNovels.filter(
        n =>
          n.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (n.author?.toLowerCase().includes(searchText.toLowerCase()) ?? false),
      );

      return isLoading && novels.length === 0 ? (
        <SourceScreenSkeletonLoading theme={theme} />
      ) : (
        <>
          {searchText ? (
            <Button
              title={`${getString(
                'common.searchFor',
              )} "${searchText}" ${getString('common.globally')}`}
              style={styles.globalSearchBtn}
              onPress={() =>
                navigation.navigate('GlobalSearchScreen', {
                  searchText,
                })
              }
            />
          ) : null}
          <LibraryView
            categoryId={route.id}
            categoryName={route.name}
            novels={novels}
            selectedNovelIds={selectedNovelIds}
            setSelectedNovelIds={setSelectedNovelIds}
            pickAndImport={pickAndImport}
            navigation={navigation}
          />
        </>
      );
    },
    [
      isLoading,
      library,
      navigation,
      pickAndImport,
      searchText,
      selectedNovelIds,
      setSelectedNovelIds,
      styles.globalSearchBtn, // Needs to be passed down if this component doesn't create it
      theme,
    ],
  );

  const renderLabel = useCallback(
    ({ route, color }: TabViewLabelProps) => {
      return (
        <Row>
          <Text style={[{ color }, styles.fontWeight600]}>{route.title}</Text>
          {showNumberOfNovels ? (
            <View
              style={[
                styles.badgeCtn,
                { backgroundColor: theme.surfaceVariant },
              ]}
            >
              <Text
                style={[styles.badgetText, { color: theme.onSurfaceVariant }]}
              >
                {route?.novelIds.length}
              </Text>
            </View>
          ) : null}
        </Row>
      );
    },
    [
      showNumberOfNovels,
      styles.badgeCtn,
      styles.badgetText,
      styles.fontWeight600,
      theme.onSurfaceVariant,
      theme.surfaceVariant,
    ],
  );

  const navigationState = useMemo(
    () => ({
      index,
      routes: categories.map(category => ({
        key: String(category.id),
        title: category.name,
        ...category,
      })),
    }),
    [categories, index],
  );

  return (
    <TabView
      commonOptions={{
        label: renderLabel,
      }}
      lazy
      navigationState={navigationState}
      renderTabBar={renderTabBar}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
};

export default React.memo(LibraryTabs);

// Styles specific to this component, usually extracted from createStyles
const createTabStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    badgeCtn: {
      borderRadius: 50,
      marginLeft: 2,
      paddingHorizontal: 6,
      paddingVertical: 2,
      position: 'relative',
    },
    badgetText: {
      fontSize: 12,
    },
    fontWeight600: {
      fontWeight: '600',
    },
    globalSearchBtn: {
      margin: 16,
    },
    tabBar: {
      borderBottomWidth: 1,
      elevation: 0,
    },
    tabBarIndicator: {
      backgroundColor: theme.primary,
      height: 3,
    },
    tabStyle: {
      minWidth: 100,
      width: 'auto',
    },
  });

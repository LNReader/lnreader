import React, { useCallback, useState, useMemo } from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import color from 'color';

import { TabView, SceneMap, TabBar, TabViewProps } from 'react-native-tab-view';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import BottomSheet from '@components/BottomSheet/BottomSheet';
import { getString } from '@strings/translations';

import { Checkbox, SortItem } from '@components/Checkbox/Checkbox';

import { overlay } from 'react-native-paper';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { ThemeColors } from '@theme/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useNovelSettings from '@hooks/persisted/novel/useNovelSettings';
import { useNovelChapters } from '@hooks/persisted';

interface ChaptersSettingsSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModalMethods | null>;
  theme: ThemeColors;
}

const ChaptersSettingsSheet = ({
  bottomSheetRef,
  theme,
}: ChaptersSettingsSheetProps) => {
  const { novelSettings, setShowChapterTitles } = useNovelSettings();
  const { sortAndFilterChapters } = useNovelChapters();

  const {
    sort = '',
    filter = '',
    showChapterTitles = false,
  } = novelSettings || {};
  const { left, right } = useSafeAreaInsets();
  const sortChapters = useCallback(
    (val: string) => sortAndFilterChapters(val, filter),
    [filter, sortAndFilterChapters],
  );

  const filterChapters = useCallback(
    (val: string) => sortAndFilterChapters(sort, val),
    [sort, sortAndFilterChapters],
  );

  // Memoize filter status calculations to prevent regex operations on every render
  const filterStatuses = useMemo(
    () => ({
      downloaded: filter.match('AND isDownloaded=1')
        ? true
        : ((filter.match('AND isDownloaded=0') ? 'indeterminate' : false) as
            | boolean
            | 'indeterminate'),
      unread: filter.match('AND `unread`=1')
        ? true
        : ((filter.match('AND `unread`=0') ? 'indeterminate' : false) as
            | boolean
            | 'indeterminate'),
      bookmarked: !!filter.match('AND bookmark=1'),
    }),
    [filter],
  );

  // Memoize checkbox handlers to prevent recreation
  const handleDownloadedPress = useCallback(() => {
    if (filter.match('AND isDownloaded=1')) {
      filterChapters(
        filter.replace(' AND isDownloaded=1', ' AND isDownloaded=0'),
      );
    } else if (filter.match('AND isDownloaded=0')) {
      filterChapters(filter.replace(' AND isDownloaded=0', ''));
    } else {
      filterChapters(filter + ' AND isDownloaded=1');
    }
  }, [filter, filterChapters]);

  const handleUnreadPress = useCallback(() => {
    if (filter.match(' AND `unread`=1')) {
      filterChapters(filter.replace(' AND `unread`=1', ' AND `unread`=0'));
    } else if (filter.match(' AND `unread`=0')) {
      filterChapters(filter.replace(' AND `unread`=0', ''));
    } else {
      filterChapters(filter + ' AND `unread`=1');
    }
  }, [filter, filterChapters]);

  const handleBookmarkedPress = useCallback(() => {
    filterChapters(
      filter.match('AND bookmark=1')
        ? filter.replace(' AND bookmark=1', '')
        : filter + ' AND bookmark=1',
    );
  }, [filter, filterChapters]);

  const FirstRoute = useCallback(() => {
    return (
      <View style={styles.flex}>
        <Checkbox
          theme={theme}
          label={getString('novelScreen.bottomSheet.filters.downloaded')}
          status={filterStatuses.downloaded}
          onPress={handleDownloadedPress}
        />
        <Checkbox
          theme={theme}
          label={getString('novelScreen.bottomSheet.filters.unread')}
          status={filterStatuses.unread}
          onPress={handleUnreadPress}
        />
        <Checkbox
          theme={theme}
          label={getString('novelScreen.bottomSheet.filters.bookmarked')}
          status={filterStatuses.bookmarked}
          onPress={handleBookmarkedPress}
        />
      </View>
    );
  }, [
    filterStatuses,
    handleDownloadedPress,
    handleUnreadPress,
    handleBookmarkedPress,
    theme,
  ]);

  // Memoize sort status calculations
  const sortStatuses = useMemo(
    () => ({
      bySource:
        sort === 'ORDER BY position ASC'
          ? 'asc'
          : sort === 'ORDER BY position DESC'
          ? 'desc'
          : undefined,
      byChapterName:
        sort === 'ORDER BY name ASC'
          ? 'asc'
          : sort === 'ORDER BY name DESC'
          ? 'desc'
          : undefined,
    }),
    [sort],
  );

  // Memoize sort handlers
  const handleSourceSortPress = useCallback(() => {
    sort === 'ORDER BY position ASC'
      ? sortChapters('ORDER BY position DESC')
      : sortChapters('ORDER BY position ASC');
  }, [sort, sortChapters]);

  const handleChapterNameSortPress = useCallback(() => {
    sort === 'ORDER BY name ASC'
      ? sortChapters('ORDER BY name DESC')
      : sortChapters('ORDER BY name ASC');
  }, [sort, sortChapters]);

  const SecondRoute = useCallback(
    () => (
      <View style={styles.flex}>
        <SortItem
          label={getString('novelScreen.bottomSheet.order.bySource')}
          status={sortStatuses.bySource}
          onPress={handleSourceSortPress}
          theme={theme}
        />
        <SortItem
          label={getString('novelScreen.bottomSheet.order.byChapterName')}
          status={sortStatuses.byChapterName}
          onPress={handleChapterNameSortPress}
          theme={theme}
        />
      </View>
    ),
    [sortStatuses, handleSourceSortPress, handleChapterNameSortPress, theme],
  );

  const ThirdRoute = useCallback(
    () => (
      <View style={styles.flex}>
        <Checkbox
          status={showChapterTitles}
          label={getString('novelScreen.bottomSheet.displays.sourceTitle')}
          onPress={() => setShowChapterTitles(true)}
          theme={theme}
        />
        <Checkbox
          status={!showChapterTitles}
          label={getString('novelScreen.bottomSheet.displays.chapterNumber')}
          onPress={() => setShowChapterTitles(false)}
          theme={theme}
        />
      </View>
    ),
    [setShowChapterTitles, showChapterTitles, theme],
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);

  // Memoize routes array to prevent recreation
  const routes = useMemo(
    () => [
      { key: 'first', title: getString('common.filter') },
      { key: 'second', title: getString('common.sort') },
      { key: 'third', title: getString('common.display') },
    ],
    [],
  );

  // Memoize tab bar styles and colors
  const tabBarStyles = useMemo(
    () => ({
      indicatorStyle: { backgroundColor: theme.primary },
      style: [
        {
          backgroundColor: overlay(2, theme.surface),
          borderBottomColor: theme.outline,
        },
        styles.tabBar,
      ],
      inactiveColor: theme.onSurfaceVariant,
      activeColor: theme.primary,
      pressColor: color(theme.primary).alpha(0.12).string(),
    }),
    [theme.primary, theme.surface, theme.outline, theme.onSurfaceVariant],
  );

  const renderTabBar: TabViewProps<any>['renderTabBar'] = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        indicatorStyle={tabBarStyles.indicatorStyle}
        style={tabBarStyles.style}
        inactiveColor={tabBarStyles.inactiveColor}
        activeColor={tabBarStyles.activeColor}
        pressColor={tabBarStyles.pressColor}
      />
    ),
    [tabBarStyles],
  );

  const renderLabel = useCallback(
    ({ route, color: localColor }: { route: any; color: string }) => {
      return <Text style={{ color: localColor }}>{route.title}</Text>;
    },
    [],
  );
  return (
    <BottomSheet
      snapPoints={[240]}
      bottomSheetRef={bottomSheetRef}
      backgroundStyle={styles.transparent}
    >
      <BottomSheetView
        style={[
          styles.contentContainer,
          {
            backgroundColor: overlay(2, theme.surface),
            marginLeft: left,
            marginRight: right,
          },
        ]}
      >
        <GestureHandlerRootView style={styles.flex}>
          <TabView
            commonOptions={{
              label: renderLabel,
            }}
            navigationState={{ index, routes }}
            renderTabBar={renderTabBar}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            style={styles.tabView}
          />
        </GestureHandlerRootView>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default ChaptersSettingsSheet;

const styles = StyleSheet.create({
  contentContainer: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flex: 1,
  },
  tabView: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: 240,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  flex: { flex: 1 },
  tabBar: { borderBottomWidth: 1, elevation: 0 },
});

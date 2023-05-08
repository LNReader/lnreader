import React, { useState } from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import color from 'color';

import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import BottomSheet from '@components/BottomSheet/BottomSheet';
import { getString } from '@strings/translations';

import { Checkbox, SortItem } from '@components/Checkbox/Checkbox';

import { showChapterTitlesAction } from '@redux/novel/novel.actions';
import { overlay } from 'react-native-paper';
const ChaptersSettingsSheet = ({
  bottomSheetRef,
  novelId,
  sortAndFilterChapters,
  dispatch,
  sort,
  filter,
  theme,
  showChapterTitles,
}) => {
  const sortChapters = val =>
    dispatch(sortAndFilterChapters(novelId, val, filter));

  const filterChapters = val =>
    dispatch(sortAndFilterChapters(novelId, sort, val));

  const FirstRoute = () => (
    <View style={{ flex: 1 }}>
      <Checkbox
        theme={theme}
        label="Downloaded"
        color={theme.primary}
        status={filter.match('AND isDownloaded = 1')}
        onPress={() =>
          filter.match('AND isDownloaded = 1')
            ? filterChapters(filter.replace(' AND isDownloaded = 1', ''))
            : filterChapters(filter + ' AND isDownloaded = 1')
        }
      />
      <Checkbox
        theme={theme}
        label="Unread"
        color={theme.primary}
        status={
          filter.match('AND `unread`=1')
            ? true
            : filter.match('AND `unread`=0')
            ? 'indeterminate'
            : false
        }
        onPress={() => {
          if (filter.match(' AND `unread`=1')) {
            filterChapters(
              filter.replace(' AND `unread`=1', ' AND `unread`=0'),
            );
          } else if (filter.match(' AND `unread`=0')) {
            filterChapters(filter.replace(' AND `unread`=0', ''));
          } else {
            filterChapters(filter + ' AND `unread`=1');
          }
        }}
      />
      <Checkbox
        theme={theme}
        label="Bookmarked"
        color={theme.primary}
        status={filter.match('AND bookmark=1')}
        onPress={() => {
          filter.match('AND bookmark=1')
            ? filterChapters(filter.replace(' AND bookmark=1', ''))
            : filterChapters(filter + ' AND bookmark=1');
        }}
      />
    </View>
  );

  const SecondRoute = () => (
    <View style={{ flex: 1 }}>
      <SortItem
        label="By source"
        status={
          sort === 'ORDER BY id ASC'
            ? 'asc'
            : sort === 'ORDER BY id DESC'
            ? 'desc'
            : undefined
        }
        onPress={() =>
          sort === 'ORDER BY id ASC'
            ? sortChapters('ORDER BY id DESC')
            : sortChapters('ORDER BY id ASC')
        }
        theme={theme}
      />
      <SortItem
        label="By chapter name"
        status={
          sort === 'ORDER BY name ASC'
            ? 'asc'
            : sort === 'ORDER BY name DESC'
            ? 'desc'
            : undefined
        }
        onPress={() =>
          sort === 'ORDER BY name ASC'
            ? sortChapters('ORDER BY name DESC')
            : sortChapters('ORDER BY name ASC')
        }
        theme={theme}
      />
    </View>
  );

  const ThirdRoute = () => (
    <View style={{ flex: 1 }}>
      <Checkbox
        status={!showChapterTitles}
        label="Source title"
        onPress={() => dispatch(showChapterTitlesAction(novelId, false))}
        theme={theme}
      />
      <Checkbox
        status={showChapterTitles}
        label="Chapter number"
        onPress={() => dispatch(showChapterTitlesAction(novelId, true))}
        theme={theme}
      />
    </View>
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: getString('novelScreen.bottomSheet.filter') },
    { key: 'second', title: getString('novelScreen.bottomSheet.sort') },
    { key: 'third', title: getString('novelScreen.bottomSheet.display') },
  ]);

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.primary }}
      style={{
        backgroundColor: overlay(2, theme.surface),
        borderBottomWidth: 1,
        borderBottomColor: theme.outline,
        elevation: 0,
      }}
      renderLabel={({ route, focused, color }) => (
        <Text style={{ color }}>{route.title}</Text>
      )}
      inactiveColor={theme.onSurfaceVariant}
      activeColor={theme.primary}
      pressColor={color(theme.primary).alpha(0.12).string()}
    />
  );

  return (
    <BottomSheet snapPoints={[240]} bottomSheetRef={bottomSheetRef}>
      <BottomSheetView
        style={[
          styles.contentContainer,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <TabView
          navigationState={{ index, routes }}
          renderTabBar={renderTabBar}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          style={{ borderTopRightRadius: 8, borderTopLeftRadius: 8 }}
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

export default ChaptersSettingsSheet;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
});

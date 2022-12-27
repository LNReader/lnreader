import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Color from 'color';

import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Bottomsheet from 'rn-sliding-up-panel';
import { getString } from '../../../../strings/translations';

import { Checkbox, SortItem } from '../../../components/Checkbox/Checkbox';

import {
  chapterPrefixStyleAction as chapterPrefixStyleAction,
  chapterTitleSeperatorAction,
  showChapterPrefixAction,
  showGeneratedChapterTitleAction,
} from '../../../redux/novel/novel.actions';
import { overlay } from 'react-native-paper';
import { dividerColor } from '../../../theme/colors';
import { RadioButton } from '@components';

const ChaptersSettingsSheet = ({
  bottomSheetRef,
  novelId,
  sortAndFilterChapters,
  dispatch,
  sort,
  filter,
  theme,
  showGeneratedChapterTitle,
  showChapterPrefix,
  chapterPrefixStyle,
  chapterTitleSeperator,
}) => {
  const { bottom } = useSafeAreaInsets();

  const bottomSheetHeight = 320 + bottom;

  const sortChapters = val =>
    dispatch(sortAndFilterChapters(novelId, val, filter));

  const filterChapters = val =>
    dispatch(sortAndFilterChapters(novelId, sort, val));

  const [animatedValue] = useState(new Animated.Value(0));

  const FirstRoute = () => (
    <View style={styles.view}>
      <Checkbox
        theme={theme}
        label="Downloaded"
        color={theme.primary}
        status={filter.match('AND downloaded=1')}
        onPress={() =>
          filter.match('AND downloaded=1')
            ? filterChapters(filter.replace(' AND downloaded=1', ''))
            : filterChapters(filter + ' AND downloaded=1')
        }
      />
      <Checkbox
        theme={theme}
        label="Unread"
        color={theme.primary}
        status={
          filter.match('AND `read`=0')
            ? true
            : filter.match('AND `read`=1')
            ? 'indeterminate'
            : false
        }
        onPress={() => {
          if (filter.match('AND `read`=0')) {
            filterChapters(filter.replace(' AND `read`=0', ' AND `read`=1'));
          } else if (filter.match('AND `read`=1')) {
            filterChapters(filter.replace(' AND `read`=1', ''));
          } else {
            filterChapters(filter + ' AND `read`=0');
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
    <View style={styles.view}>
      <SortItem
        label="By source"
        status={sort === 'ORDER BY chapterId ASC' ? 'asc' : 'desc'}
        onPress={() =>
          sort === 'ORDER BY chapterId ASC'
            ? sortChapters('ORDER BY chapterId DESC')
            : sortChapters('ORDER BY chapterId ASC')
        }
        theme={theme}
      />
    </View>
  );

  const ThirdRoute = () => (
    <View style={styles.view}>
      <Checkbox
        status={showGeneratedChapterTitle}
        label="Use generated Chapter title"
        onPress={() =>
          dispatch(
            showGeneratedChapterTitleAction(
              novelId,
              !showGeneratedChapterTitle,
            ),
          )
        }
        theme={theme}
      />
      <Checkbox
        disabled={showGeneratedChapterTitle}
        status={showChapterPrefix}
        label="Show Prefix"
        onPress={() =>
          dispatch(showChapterPrefixAction(novelId, !showChapterPrefix))
        }
        theme={theme}
      />
      <View>
        <RadioButton
          style={styles.indent}
          disabled={!showChapterPrefix || showGeneratedChapterTitle}
          status={Object.is(chapterPrefixStyle[0], 'Volume ')}
          label="Volume xx Chapter xx"
          onPress={() => {
            dispatch(
              chapterPrefixStyleAction(novelId, ['Volume ', 'Chapter ']),
            );
          }}
          theme={theme}
        />
        <RadioButton
          style={styles.indent}
          disabled={!showChapterPrefix || showGeneratedChapterTitle}
          status={Object.is(chapterPrefixStyle[0], 'Vol. ')}
          label="Vol. xx Ch. xx"
          onPress={() =>
            dispatch(chapterPrefixStyleAction(novelId, ['Vol. ', 'Ch. ']))
          }
          theme={theme}
        />
        <Checkbox
          viewStyle={styles.indent}
          disabled={!showChapterPrefix || showGeneratedChapterTitle}
          status={chapterTitleSeperator}
          label="Use Seperator"
          onPress={() =>
            dispatch(
              chapterTitleSeperatorAction(novelId, !chapterTitleSeperator),
            )
          }
          theme={theme}
        />
      </View>
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
      style={[
        {
          backgroundColor: overlay(2, theme.surface),
          borderBottomColor: dividerColor(theme.isDark),
        },
        styles.tabBar,
      ]}
      renderLabel={({ route, focused, color }) => (
        <Text style={{ color }}>{route.title}</Text>
      )}
      inactiveColor={theme.textColorSecondary}
      activeColor={theme.primary}
      pressColor={Color(theme.primary).alpha(0.12).string()}
    />
  );

  return (
    <Bottomsheet
      animatedValue={animatedValue}
      ref={bottomSheetRef}
      draggableRange={{ top: bottomSheetHeight, bottom: 0 }}
      snappingPoints={[0, bottomSheetHeight]}
      backdropOpacity={0.5}
    >
      <View
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
          style={styles.tabView}
        />
      </View>
    </Bottomsheet>
  );
};

export default ChaptersSettingsSheet;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  tabBar: {
    borderBottomWidth: 1,
    elevation: 0,
  },
  tabView: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  view: {
    flex: 1,
  },
  indent: {
    paddingLeft: 56,
  },
});

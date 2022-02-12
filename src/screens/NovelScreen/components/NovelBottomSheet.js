import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import Bottomsheet from 'rn-sliding-up-panel';

import {Checkbox, SortItem} from '../../../components/Checkbox/Checkbox';

import {showChapterTitlesAction} from '../../../redux/novel/novel.actions';

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
  const {bottom} = useSafeAreaInsets();

  const bottomSheetHeight = 220 + bottom;

  const sortChapters = val =>
    dispatch(sortAndFilterChapters(novelId, val, filter));

  const filterChapters = val =>
    dispatch(sortAndFilterChapters(novelId, sort, val));

  const [animatedValue] = useState(new Animated.Value(0));

  const FirstRoute = () => (
    <View style={{flex: 1}}>
      <Checkbox
        theme={theme}
        label="Downloaded"
        color={theme.colorAccent}
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
        color={theme.colorAccent}
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
        color={theme.colorAccent}
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
    <View style={{flex: 1}}>
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
    <View style={{flex: 1}}>
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
    {key: 'first', title: 'Filter'},
    {key: 'second', title: 'Sort'},
    {key: 'third', title: 'Display'},
  ]);

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: theme.colorAccent}}
      style={{backgroundColor: theme.colorPrimary, elevation: 0}}
      renderLabel={({route, focused, color}) => (
        <Text style={{color}}>{route.title}</Text>
      )}
      inactiveColor={theme.textColorSecondary}
      activeColor={theme.colorAccent}
      pressColor={theme.rippleColor}
    />
  );

  return (
    <Bottomsheet
      animatedValue={animatedValue}
      ref={bottomSheetRef}
      draggableRange={{top: bottomSheetHeight, bottom: 0}}
      snappingPoints={[0, bottomSheetHeight]}
      backdropOpacity={0.5}
    >
      <View
        style={[
          styles.contentContainer,
          {backgroundColor: theme.colorPrimaryDark},
        ]}
      >
        <TabView
          navigationState={{index, routes}}
          renderTabBar={renderTabBar}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
          style={{borderTopRightRadius: 8, borderTopLeftRadius: 8}}
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
});

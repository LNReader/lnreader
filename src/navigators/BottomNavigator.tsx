import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import Library from '../screens/library/LibraryScreen';
import Updates from '../screens/updates/UpdatesScreen';
import History from '../screens/history/HistoryScreen';
import Browse from '../screens/browse/BrowseScreen';
import More from '../screens/more/MoreScreen';

import { useSettings } from '../hooks/reduxHooks';
import { getString } from '../../strings/translations';
import { useTheme } from '@hooks/useTheme';
import { BottomNavigatorParamList } from './types';

const Tab = createMaterialBottomTabNavigator<BottomNavigatorParamList>();

const BottomNavigator = () => {
  const theme = useTheme();

  const {
    showHistoryTab = true,
    showUpdatesTab = true,
    showLabelsInNav = false,
  } = useSettings();

  return (
    <Tab.Navigator
      barStyle={{ backgroundColor: theme.surface2 }}
      theme={{ colors: theme }}
      activeColor={theme.onSecondaryContainer}
      shifting={!showLabelsInNav}
    >
      <Tab.Screen
        name="Library"
        component={Library}
        options={{
          title: getString('library'),
          tabBarIcon: 'book-variant-multiple',
        }}
      />
      {showUpdatesTab && (
        <Tab.Screen
          name="Updates"
          component={Updates}
          options={{
            title: getString('updates'),
            tabBarIcon: 'alert-decagram-outline',
          }}
        />
      )}
      {showHistoryTab && (
        <Tab.Screen
          name="History"
          component={History}
          options={{
            title: getString('history'),
            tabBarIcon: 'history',
          }}
        />
      )}
      <Tab.Screen
        name="Browse"
        component={Browse}
        options={{
          title: getString('browse'),
          tabBarIcon: 'compass-outline',
        }}
      />
      <Tab.Screen
        name="More"
        component={More}
        options={{
          title: getString('more'),
          tabBarIcon: 'dots-horizontal',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigator;

import React from 'react';
import Color from 'color';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import Library from '../screens/library/LibraryScreen';
import Updates from '../screens/updates/UpdatesScreen';
import History from '../screens/history/HistoryScreen';
import Browse from '../screens/browse/BrowseScreen';
import More from '../screens/more/MoreScreen';

import { useSettings } from '../hooks/reduxHooks';
import { getString } from '../../strings/translations';
import { useTheme } from '@hooks/useTheme';

const Tab = createMaterialBottomTabNavigator();

const BottomNavigator = () => {
  const theme = useTheme();

  const {
    showHistoryTab = true,
    showUpdatesTab = true,
    showLabelsInNav = false,
  } = useSettings();

  return (
    <Tab.Navigator
      barStyle={{
        backgroundColor: Color(theme.surface)
          .mix(Color(theme.primary), 0.08)
          .rgb()
          .string(),
      }}
      theme={{ colors: theme }}
      activeColor={theme.onSecondaryContainer}
      shifting={!showLabelsInNav}
    >
      <Tab.Screen
        name={getString('library')}
        component={Library}
        options={{
          tabBarIcon: 'book-variant-multiple',
        }}
      />
      {showUpdatesTab && (
        <Tab.Screen
          name={getString('updates')}
          component={Updates}
          options={{
            tabBarIcon: 'alert-decagram-outline',
          }}
        />
      )}
      {showHistoryTab && (
        <Tab.Screen
          name={getString('history')}
          component={History}
          options={{
            tabBarIcon: 'history',
          }}
        />
      )}
      <Tab.Screen
        name={getString('browse')}
        component={Browse}
        options={{
          tabBarIcon: 'compass-outline',
        }}
      />
      <Tab.Screen
        name={getString('more')}
        component={More}
        options={{
          tabBarIcon: 'dots-horizontal',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigator;

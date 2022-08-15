import React from 'react';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Library from '../screens/library/LibraryScreen';
import Updates from '../screens/updates/UpdatesScreen';
import History from '../screens/history/HistoryScreen';
import Browse from '../screens/browse/BrowseScreen';
import More from '../screens/more/MoreScreen';

import { useSettings } from '../hooks/reduxHooks';
import { getString } from '../../strings/translations';
import createMaterialBottomTabNavigator from './BottomNavigation/createMaterialBottomTabNavigator';
import { useTheme } from '@hooks/useTheme';
import Color from 'color';

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
      theme={{
        colors: {
          ...theme,
          background: theme.background,
          elevation: {
            level2: Color(theme.primary).alpha(0.08).string(),
          },
        },
      }}
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

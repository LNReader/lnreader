import React from 'react';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Library from '../screens/library/LibraryScreen';
import Updates from '../screens/updates/UpdatesScreen';
import History from '../screens/history/HistoryScreen';
import Browse from '../screens/browse/BrowseScreen';
import More from '../screens/more/MoreScreen';

import {useSettings, useTheme} from '../hooks/reduxHooks';

const Tab = createMaterialBottomTabNavigator();

const BottomNavigator = () => {
  const theme = useTheme();
  const {bottom} = useSafeAreaInsets();

  const {
    showHistoryTab = true,
    showUpdatesTab = true,
    showLabelsInNav = false,
  } = useSettings();

  return (
    <Tab.Navigator
      barStyle={{backgroundColor: theme.colorPrimary, paddingBottom: bottom}}
      activeColor={theme.colorAccent}
      shifting={!showLabelsInNav}
    >
      <Tab.Screen
        name="Library"
        component={Library}
        options={{
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="book-variant-multiple"
              color={color}
              size={24}
            />
          ),
        }}
      />
      {showUpdatesTab && (
        <Tab.Screen
          name="Updates"
          component={Updates}
          options={{
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons
                name="alert-decagram-outline"
                color={color}
                size={24}
              />
            ),
          }}
        />
      )}
      {showHistoryTab && (
        <Tab.Screen
          name="History"
          component={History}
          options={{
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons name="history" color={color} size={24} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Browse"
        component={Browse}
        options={{
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="compass-outline"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={More}
        options={{
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="dots-horizontal"
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigator;

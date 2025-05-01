import React, { useRef } from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import Novel from '../screens/novel/NovelScreen';
import Reader from '../screens/reader/ReaderScreen';

import {
  ChapterScreenProps,
  NovelScreenProps,
  ReaderStackParamList,
} from './types';
import { NovelContextProvider } from '@screens/novel/NovelContext';

const Stack = createNativeStackNavigator<ReaderStackParamList>();

const stackNavigatorConfig = { headerShown: false };

// @ts-ignore
const ReaderStack = ({ route }) => {
  const params = useRef(route?.params);

  return (
    <NovelContextProvider
      route={
        (route?.params ?? params.current) as
          | NovelScreenProps['route']
          | ChapterScreenProps['route']
      }
    >
      <Stack.Navigator screenOptions={stackNavigatorConfig}>
        <Stack.Screen name="Novel" component={Novel} />
        <Stack.Screen name="Chapter" component={Reader} />
      </Stack.Navigator>
    </NovelContextProvider>
  );
};

export default ReaderStack;

import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Appbar, List, SafeAreaView } from '@components';
import { useTheme } from '@hooks/persisted';

import { getString } from '@strings/translations';
import { SettingsScreenProps, SettingsStackParamList } from '@navigators/types';
import Settings from './Settings';
import {
  CommonActions,
  NavigationProp,
  StackActions,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';

const SettingsScreen = ({}: SettingsScreenProps) => {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const preloadSubScreen = useCallback(() => {
    navigation.dispatch(CommonActions.preload('ReaderSettings'));
  }, [navigation]);

  useEffect(() => {
    if (!isFocused) return;
    // current bug in react-navigation lets preloaded screen slide in from the left
    setTimeout(preloadSubScreen, 0);
  }, [navigation, isFocused, preloadSubScreen]);

  return (
    <SafeAreaView excludeTop>
      <Appbar
        title={getString('common.settings')}
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <ScrollView style={[styles.flex, { backgroundColor: theme.background }]}>
        {Object.typedKeys(Settings).map(key => {
          const setting = Settings[key];

          return (
            <List.Item
              key={setting.navigateParam}
              title={setting.groupTitle}
              icon={setting.icon}
              onPress={() =>
                navigation.dispatch(
                  StackActions.push(
                    key === 'reader' ? 'ReaderSettings' : 'SubScreen',
                    { settingsSource: key },
                  ),
                )
              }
              onPressIn={() => {
                if (key === 'reader') return;
                navigation.dispatch(
                  CommonActions.preload('SubScreen', { settingsSource: key }),
                );
              }}
              theme={theme}
            />
          );
        })}

        <List.Item
          title={getString('common.backup')}
          icon="cloud-upload-outline"
          onPress={() =>
            navigation.navigate('BackupSettings', { settingsSource: 'general' })
          }
          theme={theme}
        />
        <List.Item
          title={getString('advancedSettings')}
          icon="code-tags"
          onPress={() =>
            navigation.navigate('AdvancedSettings', {
              settingsSource: 'general',
            })
          }
          theme={theme}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

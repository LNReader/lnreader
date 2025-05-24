import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@hooks/persisted';
import { Appbar, List } from '@components';
import S from '../Settings';
import RenderSettings from '../dynamic/RenderSettingsGroup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '@navigators/types';
import { Settings as SettingsType } from '../Settings.d';

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  keyof Omit<SettingsStackParamList, 'Settings'>
> & { disableAppbar?: boolean };

const SettingsSubScreen = ({ navigation, route, disableAppbar }: Props) => {
  const theme = useTheme();
  const Settings = S[route.params.settingsSource as keyof SettingsType];
  const insets = useSafeAreaInsets();

  const padding = useMemo(
    () => ({
      paddingLeft: insets.left,
      paddingRight: insets.right,
      marginBottom: disableAppbar ? 0 : insets.bottom,
    }),
    [disableAppbar, insets.bottom, insets.left, insets.right],
  );

  return (
    <ScrollView style={[styles.scrollView, padding]}>
      {disableAppbar ? null : (
        <Appbar
          title={Settings.groupTitle}
          handleGoBack={navigation.goBack}
          theme={theme}
        />
      )}
      <List.Section>
        {Settings.subGroup.map((val, i) => (
          <RenderSettings
            setting={val}
            index={i}
            key={'subscreenSetting' + i}
          />
        ))}
      </List.Section>
      {!disableAppbar && <View style={{ height: insets.bottom }} />}
    </ScrollView>
  );
};

export default React.memo(SettingsSubScreen);

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    position: 'relative',
  },
});

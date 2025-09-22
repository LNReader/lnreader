import React, { useMemo } from 'react';
import { useTheme } from '@providers/Providers';
import { Appbar } from '@components';
import S, { Settings as SettingsType } from '../Settings';
import RenderSettings from '../dynamic/RenderSettingsGroup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '@navigators/types';
import { FlashList } from '@shopify/flash-list';

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  keyof Omit<SettingsStackParamList, 'Settings' | 'RespositorySettings'>
> & { disableAppbar?: boolean };

const SettingsSubScreen = ({ navigation, route, disableAppbar }: Props) => {
  const theme = useTheme();
  const Settings = S[route.params.settingsSource as keyof SettingsType];
  const insets = useSafeAreaInsets();

  const padding = useMemo(
    () => ({
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: disableAppbar ? 10 : insets.bottom,
    }),
    [disableAppbar, insets.bottom, insets.left, insets.right],
  );

  return (
    <FlashList
      contentContainerStyle={padding}
      //@ts-ignore
      data={Settings.subGroup}
      keyExtractor={(_, i) => 'subscreenSetting' + i}
      ListHeaderComponent={() =>
        disableAppbar ? null : (
          <Appbar
            title={Settings.groupTitle}
            handleGoBack={navigation.goBack}
            theme={theme}
          />
        )
      }
      renderItem={({ item, index: i }) => (
        <RenderSettings setting={item} index={i} route={route} />
      )}
    />
  );
};

export default React.memo(SettingsSubScreen);

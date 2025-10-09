import React, { memo, Suspense } from 'react';
import { SettingsItem } from '../Settings';
import SettingSwitchV2 from './components/SettingSwitchV2';
import { useTheme } from '@providers/Providers';
import SettingsThemePicker from '../components/SettingsThemePicker';
import ColorPickerModal from './modals/ColorPickerModal';
import SettingTextInput from './components/SettingTextInput';
import SelectionSettingModal from './modals/SelectionSettingModal';
import ReaderThemeSettings from './components/ReaderThemeSettings';
import TextToSpeechSettings from './components/TextToSpeechSettings';
import TrackerButton from './components/TrackerButton';
import InfoItem from './components/InfoItem';

import { SettingsStackParamList } from '@navigators/types';
import { RouteProp } from '@react-navigation/native';

const RenderSettings = ({
  setting,
  quickSettings,
  route: _route,
}: {
  setting: SettingsItem;
  quickSettings?: boolean;
  route?: RouteProp<
    SettingsStackParamList,
    keyof Omit<SettingsStackParamList, 'Settings'>
  >;
}) => {
  const theme = useTheme();

  switch (setting.type) {
    case 'Modal':
      return (
        <Suspense fallback={null}>
          <SelectionSettingModal
            setting={setting}
            theme={theme}
            quickSettings={quickSettings}
          />
        </Suspense>
      );
    case 'Switch':
      return (
        <SettingSwitchV2
          setting={setting}
          theme={theme}
          quickSettings={quickSettings}
        />
      );
    case 'ThemePicker':
      return <SettingsThemePicker settings={setting} theme={theme} />;
    case 'NumberInput':
      return (
        <Suspense fallback={null}>
          <SettingTextInput setting={setting} theme={theme} />
        </Suspense>
      );
    case 'ColorPicker':
      return (
        <Suspense fallback={null}>
          <ColorPickerModal
            settings={setting}
            theme={theme}
            showAccentColors
            quickSettings={quickSettings}
          />
        </Suspense>
      );
    case 'ReaderTheme':
      return (
        <Suspense fallback={null}>
          <ReaderThemeSettings quickSettings={quickSettings} />
        </Suspense>
      );
    case 'TTS':
      return (
        <Suspense fallback={null}>
          <TextToSpeechSettings />
        </Suspense>
      );
    case 'Tracker':
      return (
        <Suspense fallback={null}>
          <TrackerButton trackerName={setting.trackerName} />
        </Suspense>
      );
    case 'InfoItem':
      return <InfoItem title={setting.title} />;
  }
};
export default memo(RenderSettings, (prevProps, nextProps) => {
  // Only re-render if the setting object reference changes or quickSettings changes
  return (
    prevProps.setting === nextProps.setting &&
    prevProps.quickSettings === nextProps.quickSettings &&
    prevProps.route === nextProps.route
  );
});

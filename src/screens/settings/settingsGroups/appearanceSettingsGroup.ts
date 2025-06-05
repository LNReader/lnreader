import { getString } from '@strings/translations';
import { appearanceIds, SettingsGroup } from '../Settings.d';
import { darkThemes, lightThemes } from '@theme/md3';

const AppearanceSettings: SettingsGroup<appearanceIds> = {
  groupTitle: getString('appearance'),
  icon: 'palette-outline',
  navigateParam: 'AppearanceSettings',
  subGroup: [
    {
      subGroupTitle: getString('appearanceScreen.appTheme'),
      id: 'appTheme',
      settings: [
        {
          title: getString('appearanceScreen.lightTheme'),
          type: 'ThemePicker',
          options: lightThemes,
        },
        {
          title: getString('appearanceScreen.darkTheme'),
          type: 'ThemePicker',
          options: darkThemes,
        },
        {
          type: 'ColorPicker',
          title: getString('appearanceScreen.accentColor'),
          description: c => c.toUpperCase() ?? '',
          settingsOrigin: 'MMKV',
          valueKey: undefined,
        },
      ],
    },
    {
      subGroupTitle: getString('appearanceScreen.novelInfo'),
      id: 'novelInfo',
      settings: [
        {
          title: getString('appearanceScreen.hideBackdrop'),
          type: 'Switch',
          valueKey: 'hideBackdrop',
        },
        {
          title: getString('advancedSettingsScreen.useFAB'),
          type: 'Switch',
          valueKey: 'useFabForContinueReading',
        },
      ],
    },
    {
      subGroupTitle: getString('appearanceScreen.navbar'),
      id: 'navbar',
      settings: [
        {
          title: getString('appearanceScreen.showUpdatesInTheNav'),
          type: 'Switch',
          valueKey: 'showUpdatesTab',
        },
        {
          title: getString('appearanceScreen.showHistoryInTheNav'),
          type: 'Switch',
          valueKey: 'showHistoryTab',
        },
        {
          title: getString('appearanceScreen.alwaysShowNavLabels'),
          type: 'Switch',
          valueKey: 'showLabelsInNav',
        },
      ],
    },
  ],
};
export default AppearanceSettings;

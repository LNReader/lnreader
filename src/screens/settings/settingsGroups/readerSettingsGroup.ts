import { getString } from '@strings/translations';
import { readerIds, SettingsGroup } from '../Settings.d';
const ReaderSettings: SettingsGroup<readerIds> = {
  groupTitle: getString('readerSettings.title'),
  icon: 'book-open-outline',
  navigateParam: 'ReaderSettings',
  subGroup: [
    {
      subGroupTitle: getString('generalSettings'),
      id: 'general',
      settings: [
        {
          title: getString('readerScreen.bottomSheet.keepScreenOn'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'keepScreenOn',
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.swipeGestures'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'swipeGestures',
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.pageReader'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'pageReader',
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.volumeButtonsScroll'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'useVolumeButtons',
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.tapToScroll'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'tapToScroll',
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.removeExtraSpacing'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'removeExtraParagraphSpacing',
          quickSettings: true,
        },
      ],
    },
    {
      subGroupTitle: getString('readerScreen.bottomSheet.autoscroll'),
      id: 'autoScroll',
      settings: [
        {
          title: getString('readerScreen.bottomSheet.autoscroll'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'autoScroll',
          quickSettings: true,
          dependents: [
            {
              title: getString('readerSettings.autoScrollInterval'),
              type: 'NumberInput',
              settingOrigin: 'GeneralChapter',
              valueKey: 'autoScrollInterval',
            },
            {
              title: getString('readerSettings.autoScrollOffset'),
              type: 'NumberInput',
              settingOrigin: 'GeneralChapter',
              valueKey: 'autoScrollOffset',
            },
          ],
        },
      ],
    },
    {
      subGroupTitle: getString('readerSettings.customCSS'),
      id: 'customCSS',
      settings: [
        {
          title: getString('readerSettings.customCSS'),
          type: 'TextArea',
          settingOrigin: 'ReaderChapter',
          valueKey: 'customCSS',
          placeholder: 'body {margin: 10px;}',
          description: getString('readerSettings.cssHint'),
          openFileLabel: getString('readerSettings.openCSSFile'),
          clearDialog: getString('readerSettings.clearCustomCSS'),
        },
      ],
    },
    {
      subGroupTitle: getString('readerSettings.customJS'),
      id: 'customJS',
      settings: [
        {
          title: getString('readerSettings.customJS'),
          type: 'TextArea',
          settingOrigin: 'ReaderChapter',
          valueKey: 'customJS',
          placeholder: "document.getElementById('example');",
          description: getString('readerSettings.jsHint'),
          openFileLabel: getString('readerSettings.openJSFile'),
          clearDialog: getString('readerSettings.clearCustomJS'),
        },
      ],
    },
    {
      subGroupTitle: getString('common.display'),
      id: 'display',
      settings: [
        {
          title: getString('readerScreen.bottomSheet.fullscreen'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'fullScreenMode',
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.verticalSeekbar'),
          description: getString('readerSettings.verticalSeekbarDesc'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'verticalSeekbar',
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.bionicReading'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'bionicReading',
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.showProgressPercentage'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'showScrollPercentage',
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.showBatteryAndTime'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'showBatteryAndTime',
          quickSettings: true,
        },
      ],
    },
    {
      subGroupTitle: getString('readerSettings.readerTheme'),
      id: 'readerTheme',
      settings: [
        {
          type: 'ReaderTheme',
          quickSettings: true,
        },
      ],
    },
    {
      subGroupTitle: 'TTS',
      id: 'tts',
      settings: [
        {
          type: 'TTS',
        },
      ],
    },
  ],
};
export default ReaderSettings;

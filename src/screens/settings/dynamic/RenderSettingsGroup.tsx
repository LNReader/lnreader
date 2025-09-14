import { List } from '@components';
import { SettingSubGroup } from '../Settings';
import { useTheme } from '@hooks/persisted';
import RenderSettings from './RenderSettings';
import { RouteProp } from '@react-navigation/native';
import { SettingsStackParamList } from '@navigators/types';
import { View } from 'react-native';
import { sharedStyles } from './utils/sharedStyles';

export default function ({
  setting,
  index,
  route,
}: {
  setting: SettingSubGroup<string>;
  index: number;
  route: RouteProp<
    SettingsStackParamList,
    keyof Omit<SettingsStackParamList, 'Settings'>
  >;
}) {
  const theme = useTheme();

  return (
    <View style={sharedStyles.flex}>
      {index === 0 ? null : <List.Divider theme={theme} />}
      <List.SubHeader key={'subHeader' + index} theme={theme}>
        {setting.subGroupTitle}
      </List.SubHeader>
      {setting.settings.map((settingOption, i) => {
        return (
          <RenderSettings
            setting={settingOption}
            key={'set' + index + i}
            route={route}
          />
        );
      })}
    </View>
  );
}

// Using shared styles instead of local styles

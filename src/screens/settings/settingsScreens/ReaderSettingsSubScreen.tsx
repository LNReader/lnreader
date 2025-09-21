import { View, Dimensions, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Appbar } from '@components/index';
import { useTheme } from '@providers/Providers';
import { getString } from '@strings/translations';
import SettingsSubScreen from './SettingsSubScreen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '@navigators/types';
import { WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import SettingsWebView from './SettingsWebView';

export type TextAlignments =
  | 'left'
  | 'center'
  | 'auto'
  | 'right'
  | 'justify'
  | undefined;

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  keyof Omit<SettingsStackParamList, 'Settings' | 'RespositorySettings'>
>;

const ReaderSettingsSubScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();

  const [webViewHeight, setWebViewHeight] = useState(280);
  const layoutHeight = Dimensions.get('window').height;
  const newRoute: typeof route = {
    ...route,
    params: {
      settingsSource: 'reader',
    },
  };

  return (
    <>
      <Appbar
        mode="small"
        title={getString('readerSettings.title')}
        handleGoBack={navigation.goBack}
        theme={theme}
      />

      <View style={{ height: webViewHeight }}>
        <SettingsWebView />
      </View>

      <View
        style={[
          styles.view,
          {
            backgroundColor: theme.outline,
          },
        ]}
        onTouchMove={e => {
          const newHeight = e.nativeEvent.pageY - 10 - 84;
          if (newHeight < WINDOW_HEIGHT * 0.7) {
            setWebViewHeight(newHeight);
          }
        }}
      >
        <Text style={styles.bar}>••••</Text>
      </View>

      <View
        style={{
          height: layoutHeight - 98 - webViewHeight,
        }}
      >
        <SettingsSubScreen
          navigation={navigation}
          route={newRoute}
          disableAppbar
        />
      </View>
    </>
  );
};
export default ReaderSettingsSubScreen;

const styles = StyleSheet.create({
  view: {
    width: '100%',
    height: 14,
  },
  bar: { textAlign: 'center', lineHeight: 16 },
});

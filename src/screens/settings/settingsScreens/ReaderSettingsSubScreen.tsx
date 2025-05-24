import { View, Dimensions, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Appbar } from '@components/index';
import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';
import SettingsSubScreen from './SettingsSubScreen';
import { StackScreenProps } from '@react-navigation/stack';
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

type Props = StackScreenProps<
  SettingsStackParamList,
  keyof Omit<SettingsStackParamList, 'Settings'>
>;

const ReaderSettingsSubScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();

  const [webViewHeight, setWebViewHeight] = useState(280);
  const layoutHeight = Dimensions.get('window').height;

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
          route={route}
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

import React from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';

import {Appbar as PaperAppbar} from 'react-native-paper';
import {ThemeType} from '../../theme/types';

interface AppbarProps {
  title: string;
  handleGoBack: () => void;
  theme: ThemeType;
}

const Appbar: React.FC<AppbarProps> = ({title, handleGoBack, theme}) => (
  <PaperAppbar.Header
    style={{backgroundColor: theme.background}}
    statusBarHeight={StatusBar.currentHeight}
  >
    {handleGoBack && <PaperAppbar.BackAction onPress={handleGoBack} />}
    <PaperAppbar.Content
      title={title}
      titleStyle={{color: theme.textColorPrimary}}
    />
  </PaperAppbar.Header>
);

export default Appbar;

const styles = StyleSheet.create({});

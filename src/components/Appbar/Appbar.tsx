import React from 'react';
import { StatusBar } from 'react-native';

import { Appbar as PaperAppbar } from 'react-native-paper';
import { ThemeTypeV1 } from '../../theme/v1/theme/types';

interface AppbarProps {
  title: string;
  handleGoBack: () => void;
  theme: ThemeTypeV1;
}

const Appbar: React.FC<AppbarProps> = ({ title, handleGoBack, theme }) => (
  <PaperAppbar.Header
    style={{ backgroundColor: theme.colorPrimary }}
    statusBarHeight={StatusBar.currentHeight}
  >
    {handleGoBack && <PaperAppbar.BackAction onPress={handleGoBack} />}
    <PaperAppbar.Content
      title={title}
      titleStyle={{ color: theme.textColorPrimary }}
    />
  </PaperAppbar.Header>
);

export default Appbar;

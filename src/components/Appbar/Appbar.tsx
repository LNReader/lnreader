import React from 'react';
import { StatusBar } from 'react-native';

import { Appbar as PaperAppbar } from 'react-native-paper';
import { MD3ThemeType } from '../../theme/types';

interface AppbarProps {
  title: string;
  handleGoBack: () => void;
  theme: MD3ThemeType;
  mode?: 'small' | 'medium' | 'large' | 'center-aligned';
}

const Appbar: React.FC<AppbarProps> = ({
  title,
  handleGoBack,
  theme,
  mode = 'large',
  children,
}) => (
  <PaperAppbar.Header
    style={{ backgroundColor: theme.surface }}
    statusBarHeight={StatusBar.currentHeight}
    mode={mode}
  >
    {handleGoBack && (
      <PaperAppbar.BackAction
        onPress={handleGoBack}
        iconColor={theme.textColorPrimary}
      />
    )}
    <PaperAppbar.Content
      title={title}
      titleStyle={{ color: theme.textColorPrimary }}
    />
    {children}
  </PaperAppbar.Header>
);

export default Appbar;

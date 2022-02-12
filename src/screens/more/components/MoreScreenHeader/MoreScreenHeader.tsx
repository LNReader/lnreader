import React from 'react';
import {StatusBar, StyleSheet, Image, View} from 'react-native';

import {Appbar as PaperAppbar} from 'react-native-paper';
import {ThemeType} from '../../../../theme/types';

interface Props {
  theme: ThemeType;
}

const MoreScreenHeader: React.FC<Props> = ({theme}) => (
  <>
    <PaperAppbar.Header
      style={[{backgroundColor: theme.background}, styles.header]}
      statusBarHeight={StatusBar.currentHeight}
    >
      <PaperAppbar.Content
        title="More"
        titleStyle={{color: theme.textColorPrimary}}
      />
    </PaperAppbar.Header>
    <View style={styles.elevation}>
      <View style={[styles.logoContainer, {backgroundColor: theme.background}]}>
        <Image
          source={require('../../../../../assets/logo.png')}
          style={[styles.logo, {tintColor: theme.textColorPrimary}]}
        />
      </View>
    </View>
  </>
);

export default MoreScreenHeader;

const styles = StyleSheet.create({
  header: {
    elevation: 0,
  },
  elevation: {
    overflow: 'hidden',
    paddingBottom: 4,
  },
  logoContainer: {
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
    elevation: 4,
  },
  logo: {
    height: 80,
    width: 80,
  },
});

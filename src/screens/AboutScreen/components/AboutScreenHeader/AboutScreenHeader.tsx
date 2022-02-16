import React from 'react';
import {StatusBar, StyleSheet, Image, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Appbar as PaperAppbar} from 'react-native-paper';

import {ThemeType} from '../../../../theme/types';

interface Props {
  theme: ThemeType;
}

const AboutScreenHeader: React.FC<Props> = ({theme}) => {
  const {goBack} = useNavigation();
  return (
    <>
      <PaperAppbar.Header
        style={[{backgroundColor: theme.background}, styles.header]}
        statusBarHeight={StatusBar.currentHeight}
      >
        <PaperAppbar.BackAction onPress={goBack} />
        <PaperAppbar.Content
          title="About"
          titleStyle={{color: theme.textColorPrimary}}
        />
      </PaperAppbar.Header>
      <View style={styles.elevation}>
        <View
          style={[styles.logoContainer, {backgroundColor: theme.background}]}
        >
          <Image
            source={require('../../../../../assets/logo.png')}
            style={[styles.logo, {tintColor: theme.textColorPrimary}]}
          />
        </View>
      </View>
    </>
  );
};

export default AboutScreenHeader;

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

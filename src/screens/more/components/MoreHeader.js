import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Appbar, List } from '@components';

export const MoreHeader = ({ title, navigation, theme, goBack }) => (
  <>
    <Appbar
      title={title}
      handleGoBack={goBack && navigation.goBack}
      mode="small"
      theme={theme}
    />
    <View style={{ overflow: 'hidden', paddingBottom: 4 }}>
      <View style={[styles.logoContainer, { backgroundColor: theme.surface }]}>
        <Image
          source={require('../../../../assets/logo.png')}
          style={[styles.logo, { tintColor: theme.onSurface }]}
        />
      </View>
    </View>
    <List.Divider theme={theme} />
  </>
);

const styles = StyleSheet.create({
  logoContainer: {
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logo: {
    height: 80,
    width: 80,
  },
});

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Appbar } from '../../../components/Appbar';

export const MoreHeader = ({ title, navigation, theme, goBack }) => (
  <>
    <Appbar
      title={title}
      onBackAction={goBack && navigation.goBack}
      style={{ elevation: 0 }}
      mode="small"
    />
    <View style={{ overflow: 'hidden', paddingBottom: 4 }}>
      <View style={[styles.logoContainer, { backgroundColor: theme.surface }]}>
        <Image
          source={require('../../../../assets/logo.png')}
          style={[styles.logo, { tintColor: theme.textColorPrimary }]}
        />
      </View>
    </View>
  </>
);

const styles = StyleSheet.create({
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

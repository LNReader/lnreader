import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { getString } from '../../../../../strings/translations';
import { Button } from '../../../../components';
import { ButtonVariation } from '../../../../components/Button/Button';

import { ThemeType } from '../../../../theme/types';

interface Props {
  theme: ThemeType;
}

const MalCard: React.FC<Props> = ({ theme }) => {
  const { navigate } = useNavigation();

  return (
    <Pressable
      style={styles.container}
      onPress={() => navigate('BrowseMal' as never)}
      android_ripple={{ color: theme.rippleColor }}
    >
      <View style={styles.flexRow}>
        <Image
          source={require('../../../../../assets/mal.png')}
          style={styles.icon}
        />
        <View style={styles.details}>
          <Text style={{ color: theme.textColorPrimary }}>MyAnimeList</Text>
        </View>
      </View>
      <View style={styles.flexRow}>
        <Button
          title={getString('browse')}
          variation={ButtonVariation.CLEAR}
          textColor={theme.colorAccent}
          onPress={() => navigate('BrowseMal' as never)}
          theme={theme}
        />
      </View>
    </Pressable>
  );
};

export default MalCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingVertical: 12,
  },
  icon: {
    height: 40,
    width: 40,
    borderRadius: 4,
  },
  details: {
    marginLeft: 16,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

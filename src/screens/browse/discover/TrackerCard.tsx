import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { getString } from '../../../../strings/translations';
import { Button } from '../../../components';

import { ThemeColors } from '../../../theme/types';

interface Props {
  trackerName: string;
  icon: ImageSourcePropType;
  navTarget: string;
  theme: ThemeColors;
}

const TrackerCard: React.FC<Props> = ({
  theme,
  icon,
  trackerName,
  navTarget,
}) => {
  const { navigate } = useNavigation();

  return (
    <Pressable
      style={styles.container}
      onPress={() => navigate(navTarget as never)}
      android_ripple={{ color: theme.rippleColor }}
    >
      <View style={styles.flexRow}>
        <Image source={icon} style={styles.icon} />
        <View style={styles.details}>
          <Text style={{ color: theme.onSurface }}>{trackerName}</Text>
        </View>
      </View>
      <View style={styles.flexRow}>
        <Button
          title={getString('browse')}
          textColor={theme.primary}
          onPress={() => navigate(navTarget as never)}
        />
      </View>
    </Pressable>
  );
};

export default TrackerCard;

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

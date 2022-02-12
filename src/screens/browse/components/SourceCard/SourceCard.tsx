import React from 'react';
import {StyleSheet, Text, View, Image, Pressable} from 'react-native';
import {Button, IconButton} from '../../../../components';

import {Source} from '../../../../sources/types';
import {ThemeType} from '../../../../theme/types';

interface Props {
  source: Source;
  isPinned: boolean;
  theme: ThemeType;
  onTogglePinSource: (sourceId: number) => void;
  onPress: () => void;
}

const SourceCard: React.FC<Props> = ({
  source,
  isPinned,
  onPress,
  onTogglePinSource,
  theme,
}) => (
  <Pressable
    style={styles.container}
    onPress={onPress}
    android_ripple={{color: theme.rippleColor}}
  >
    <View style={styles.flexRow}>
      <Image source={{uri: source.icon}} style={styles.icon} />
      <View style={styles.details}>
        <Text style={{color: theme.textColorPrimary}}>{source.name}</Text>
        <Text style={[{color: theme.textColorSecondary}, styles.lang]}>
          {source.lang}
        </Text>
      </View>
    </View>
    <View style={styles.flexRow}>
      <Button
        title="Browse"
        variation="clear"
        textColor={theme.primary}
        onPress={onPress}
        theme={theme}
        margin={0}
      />
      <IconButton
        name={isPinned ? 'pin' : 'pin-outline'}
        size={22}
        color={isPinned ? theme.primary : theme.textColorSecondary}
        onPress={() => onTogglePinSource(source.id)}
        theme={theme}
      />
    </View>
  </Pressable>
);

export default SourceCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  icon: {
    height: 36,
    width: 36,
    borderRadius: 4,
  },
  details: {
    marginLeft: 16,
  },
  lang: {
    fontSize: 12,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

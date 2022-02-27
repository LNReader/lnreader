import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {IconButton} from '..';
import {ThemeType} from '../../theme/types';

interface Action {
  icon: string;
  onPress: () => void;
  color?: string;
}

interface ActionbarProps {
  visible: boolean;
  actions: Action[];
  theme: ThemeType;
}

const Actionbar: React.FC<ActionbarProps> = ({visible, actions, theme}) => {
  if (visible) {
    return (
      <View style={[styles.actionBar, {backgroundColor: theme.surface}]}>
        {actions.map((action, index) => (
          <IconButton
            key={index}
            name={action.icon}
            color={theme.textColorPrimary}
            onPress={action.onPress}
            theme={theme}
          />
        ))}
      </View>
    );
  } else {
    return null;
  }
};

export default Actionbar;

const styles = StyleSheet.create({
  actionBar: {
    position: 'absolute',
    width: Dimensions.get('window').width - 32,
    bottom: 0,
    margin: 16,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 32,
    elevation: 2,
  },
});

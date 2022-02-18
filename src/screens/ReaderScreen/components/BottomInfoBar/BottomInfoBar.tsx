import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useReaderSettings} from '../../../../redux/hooks';

interface BottomInfoBarProps {
  percentage: number;
  background: string;
  color: string;
}

const BottomInfoBar: React.FC<BottomInfoBarProps> = ({
  percentage,
  background,
  color,
}) => {
  const {showProgressPercentage} = useReaderSettings();

  return showProgressPercentage ? (
    <View style={[styles.container, {backgroundColor: background}]}>
      {showProgressPercentage ? (
        <Text style={{color}}>{`${percentage}%`}</Text>
      ) : null}
    </View>
  ) : null;
};

export default BottomInfoBar;

const styles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

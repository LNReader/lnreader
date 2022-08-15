import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Modal, overlay } from 'react-native-paper';
import {
  RadioButton,
  RadioButtonGroup,
} from '../../../../components/RadioButton';

const SetTrackScoreDialog = ({
  trackItem,
  trackScoreDialog,
  setTrackScoreDialog,
  updateTrackScore,
  theme,
}) => {
  const getScoreLabel = score => {
    const myanimeListScores = {
      0: 'No Score',
      1: 'Apalling',
      2: 'Horrible',
      3: 'Very Bad',
      4: 'Bad',
      5: 'Average',
      6: 'Fine',
      7: 'Good',
      8: 'Very Good',
      9: 'Great',
      10: 'Masterpiece',
    };

    return `(${score}) ${myanimeListScores[score]}`;
  };

  return (
    <Modal
      visible={trackScoreDialog}
      onDismiss={() => setTrackScoreDialog(false)}
      contentContainerStyle={[
        styles.containerStyle,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
      theme={{ colors: { backdrop: 'rgba(0,0,0,0.25)' } }}
    >
      <Text style={[styles.dialogTitle, { color: theme.textColorPrimary }]}>
        Score
      </Text>
      <RadioButtonGroup
        onValueChange={updateTrackScore}
        value={trackItem.my_list_status.score}
      >
        {[...Array(11).keys()].map((item, index) => (
          <RadioButton
            key={index}
            value={item}
            label={getScoreLabel(item)}
            theme={theme}
          />
        ))}
      </RadioButtonGroup>
    </Modal>
  );
};

export default SetTrackScoreDialog;

const styles = StyleSheet.create({
  containerStyle: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
  },
  dialogTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
});

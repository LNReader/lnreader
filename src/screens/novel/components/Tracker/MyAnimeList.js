import React from 'react';
import {
  RadioButton,
  RadioButtonGroup,
} from '../../../../components/RadioButton';

export const MyAnimeListScoreSelector = ({
  trackItem,
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
    <RadioButtonGroup onValueChange={updateTrackScore} value={trackItem.score}>
      {[...Array(11).keys()].map((item, index) => (
        <RadioButton
          key={index}
          value={item}
          label={getScoreLabel(item)}
          theme={theme}
        />
      ))}
    </RadioButtonGroup>
  );
};

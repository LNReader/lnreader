import React from 'react';
import {
  RadioButton,
  RadioButtonGroup,
} from '../../../../components/RadioButton';

export const MangaUpdatesScoreSelector = ({
  trackItem,
  updateTrackScore,
  theme,
}) => {
  const getScoreLabel = score => {
    const mangaUpdatesScores = {
      0: 'No Score',
      1: '(1) Worst',
      2: '(2) Really Bad',
      3: '(3) Bad',
      4: '(4) Below Average',
      5: '(5) Average',
      6: '(6) Fine',
      7: '(7) Good',
      8: '(8) Very Good',
      9: '(9) Great',
      10: '(10) Masterpiece',
    };

    return mangaUpdatesScores[score];
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

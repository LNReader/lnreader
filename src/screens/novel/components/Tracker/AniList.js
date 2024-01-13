import React from 'react';
import {
  RadioButton,
  RadioButtonGroup,
} from '../../../../components/RadioButton';
import { ScrollView } from 'react-native';

/**
 * @typedef {Object} ScoreFormatting
 * @property {number} count The number of score values in this format
 * @property {(score: number) => string} label A function that converts the score to a label
 *
 * @param {"POINT_100" | "POINT_10_DECIMAL" | "POINT_10" | "POINT_5" | "POINT_3"} scoreFormat
 * @param {boolean?} shorten
 * @returns {ScoreFormatting}
 */
export function getScoreFormatting(scoreFormat, shorten) {
  switch (scoreFormat) {
    case 'POINT_100':
      return {
        count: 101,
        label: score => (score ? score.toLocaleString() : '-'),
      };
    case 'POINT_10_DECIMAL':
      return {
        count: 101,
        label: score => (score ? (score / 10).toLocaleString() : '-'),
      };
    case 'POINT_10':
      return {
        count: 11,
        label: score => (score ? score.toLocaleString() : '-'),
      };
    case 'POINT_5':
      return {
        count: 6,
        label: score => {
          if (shorten) {
            return score ? `${score}★` : '-';
          }
          return '★'.repeat(score) || '-';
        },
      };
    case 'POINT_3':
      return {
        count: 4,
        label: score => {
          switch (score) {
            case 0:
              return '-';
            case 1:
              return '☹️';
            case 2:
              return '😐';
            case 3:
              return '😃';
          }
        },
      };
  }
}

export const AniListScoreSelector = ({
  trackItem,
  updateTrackScore,
  auth,
  theme,
}) => {
  const formatting = getScoreFormatting(auth.meta.scoreFormat);
  return (
    <ScrollView>
      <RadioButtonGroup
        onValueChange={updateTrackScore}
        value={trackItem.score}
      >
        {[...Array(formatting.count).keys()].map((item, index) => (
          <RadioButton
            key={index}
            value={item}
            label={formatting.label(item)}
            theme={theme}
          />
        ))}
      </RadioButtonGroup>
    </ScrollView>
  );
};

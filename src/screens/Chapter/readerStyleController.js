export const readerBackground = val => {
  const backgroundColor = {
    1: '#000000',
    2: '#FFFFFF',
    3: '#F7DFC6',
    4: '#292832',
    5: '#2B2C30',
    6: '#dce5e2',
  };

  return backgroundColor[val] || val;
};

export const readerTextColor = val => {
  const textColor = {
    1: 'rgba(255,255,255,0.7)',
    2: '#111111',
    3: '#593100',
    4: '#CCCCCC',
    5: '#CCCCCC',
    6: '#000000',
  };

  return textColor[val] || val;
};

export const readerLineHeight = (fontSize, lineHeightMultiplier) => {
  let lineHeight = fontSize * lineHeightMultiplier;

  lineHeight = Math.round(lineHeight);

  return lineHeight;
};

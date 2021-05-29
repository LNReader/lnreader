export const readerBackground = (val) => {
    const backgroundColor = {
        1: "#000000",
        2: "#FFFFFF",
        3: "#F4ECD8",
    };

    return backgroundColor[val] ?? "#FFFFFF";
};

export const readerTextColor = (val) => {
    const textColor = val === 1 ? "rgba(255,255,255,0.7)" : "#000000";

    return textColor;
};

export const readerLineHeight = (fontSize, lineHeightMultiplier) => {
    let lineHeight = fontSize * lineHeightMultiplier;

    lineHeight = Math.round(lineHeight);

    return lineHeight;
};

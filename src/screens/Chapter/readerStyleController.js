export const readerBackground = (val) => {
    const backgroundColor = {
        1: "#000000",
        2: "#FFFFFF",
        3: "#F4ECD8",
        4: "#444444",
    };

    return backgroundColor[val] ?? val;
};

export const readerTextColor = (val) => {
    const textColor =
        val === 1 ? "rgba(255,255,255,0.7)" : val === 4 ? "#FFFFFF" : "#000000";

    return textColor ?? val;
};

export const readerLineHeight = (fontSize, lineHeightMultiplier) => {
    let lineHeight = fontSize * lineHeightMultiplier;

    lineHeight = Math.round(lineHeight);

    return lineHeight;
};

export const errorTextColor = (val) => {
    const textColor = val === 1 ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.54)";

    return textColor;
};

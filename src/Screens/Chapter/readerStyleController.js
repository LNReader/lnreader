export const readerBackground = (val) => {
    const backgroundColor = {
        1: "#000000",
        2: "#FFFFFF",
        3: "#F4ECD8",
    };

    return backgroundColor[val];
};

export const readerTextColor = (val) => {
    const textColor = val === 1 ? "rgba(255,255,255,0.7)" : "#000000";

    return textColor;
};

export const readerLineHeight = (val) => {
    const lineHeight = {
        12: 20,
        14: 22,
        16: 25,
        18: 26,
        20: 28,
    };

    return lineHeight[val];
};

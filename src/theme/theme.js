import {
    AccentColors,
    PrimaryColors,
    RippleColors,
    StatusBarStyle,
    TextColors,
} from "./colors";

/**
 * Light
 */
export const lightTheme = {
    id: 1,
    name: "Light",
    ...PrimaryColors.light,
    ...TextColors.light,
    colorAccent: AccentColors.default,
    rippleColor: RippleColors.default,
    searchBarColor: "#FFFFFF",
    menuColor: "#FFFFFF",
    dividerColor: "rgba(0,0,0,0.1)",
    filterColor: "#FFC107",
    colorDisabled: "rgba(220,220,220,255)",
    colorButtonText: "#FFFFFF",
    statusBar: StatusBarStyle.DARK,
};

/**
 * Dark
 */
export const darkTheme = {
    id: 2,
    name: "Dark",
    ...PrimaryColors.dark,
    ...TextColors.dark,
    colorAccent: AccentColors.defaultDark,
    rippleColor: RippleColors.default,
    searchBarColor: "#303135",
    menuColor: "#242529",
    filterColor: "#FFEB3B",
    dividerColor: "rgba(255,255,255,0.1)",
    colorDisabled: "rgba(57,57,57,255)",
    colorButtonText: "#FFFFFF",
    statusBar: StatusBarStyle.LIGHT,
};

/**
 * Amoled Dark
 */
export const amoledDarkTheme = {
    id: 0,
    name: "AMOLED Dark",
    ...PrimaryColors.amoled,
    colorAccent: AccentColors.defaultDark,
    rippleColor: RippleColors.default,
    searchBarColor: "#1F1F1F",
    menuColor: "#242529",
    filterColor: "#FFEB3B",
    dividerColor: "rgba(255,255,255,0.15)",
    colorDisabled: "rgba(33,33,33,255)",
    colorButtonText: "#FFFFFF",
    statusBar: StatusBarStyle.LIGHT,
    ...TextColors.dark,
};

/**
 * Midnight Dusk
 */
export const midnightDuskTheme = {
    id: 3,
    name: "Midnight Dusk",
    ...PrimaryColors.midnightDusk,
    colorAccent: AccentColors.midnightDusk,
    rippleColor: RippleColors.midnightDusk,
    searchBarColor: "#201F27",
    menuColor: "#201F27",
    filterColor: "#FFEB3B",
    dividerColor: "rgba(255,255,255,0.1)",
    colorDisabled: "rgba(57,57,57,255)",
    colorButtonText: "#FFFFFF",
    statusBar: StatusBarStyle.LIGHT,
    ...TextColors.dark,
};

/**
 * Lime
 */

export const greenAppleTheme = {
    id: 4,
    name: "Green Apple",
    ...PrimaryColors.dark,
    ...TextColors.dark,
    colorAccent: AccentColors.greenApple,
    rippleColor: RippleColors.greenApple,
    searchBarColor: "#303135",
    menuColor: "#242529",
    filterColor: "#FFEB3B",
    dividerColor: "rgba(255,255,255,0.1)",
    colorDisabled: "rgba(57,57,57,255)",
    colorButtonText: "#000000",
    statusBar: StatusBarStyle.LIGHT,
};

/**
 * Hot Pink Theme
 */

export const hotPinkTheme = {
    id: 6,
    name: "AMOLED Hot Pink",
    ...PrimaryColors.amoled,
    ...TextColors.dark,
    colorAccent: AccentColors.hotPink,
    rippleColor: RippleColors.hotPink,
    searchBarColor: "#1F1F1F",
    menuColor: "#242529",
    filterColor: "#FFEB3B",
    dividerColor: "rgba(255,255,255,0.15)",
    colorDisabled: "rgba(33,33,33,255)",
    colorButtonText: "#FFFFFF",
    statusBar: StatusBarStyle.LIGHT,
};

/**
 * Strawberry Daiquiri
 */

export const strawberryDaiquiri = {
    id: 7,
    name: "Strawberry Daiquiri",
    ...PrimaryColors.dark,
    colorAccent: AccentColors.strawberryDaiquiri,
    rippleColor: RippleColors.strawberryDaiquiri,
    searchBarColor: "#303135",
    menuColor: "#242529",
    filterColor: "#FFEB3B",
    dividerColor: "rgba(255,255,255,0.1)",
    colorDisabled: "rgba(57,57,57,255)",
    colorButtonText: "#FFFFFF",
    statusBar: StatusBarStyle.LIGHT,
    ...TextColors.dark,
};

export const irisBlueTheme = {
    id: 5,
    name: "Iris Blue",
    ...PrimaryColors.irisBlue,
    ...TextColors.dark,
    colorAccent: AccentColors.irisBlue,
    rippleColor: RippleColors.irisBlue,
    searchBarColor: "#393e46",
    menuColor: "#393e46",
    filterColor: "#FFEB3B",
    dividerColor: "rgba(255,255,255,0.1)",
    colorDisabled: "#393e46",
    colorButtonText: "#16151D",
    statusBar: StatusBarStyle.LIGHT,
};

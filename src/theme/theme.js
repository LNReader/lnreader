import {
    AccentColors,
    DividerColors,
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
    dividerColor: DividerColors.LIGHT,
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
    dividerColor: DividerColors.DARK,
    colorDisabled: PrimaryColors.dark.colorPrimary,
    colorButtonText: "#FFFFFF",
    statusBar: StatusBarStyle.LIGHT,
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
    dividerColor: DividerColors.DARK,
    colorDisabled: "#201F27",
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
    dividerColor: DividerColors.DARK,
    colorDisabled: "rgba(57,57,57,255)",
    colorButtonText: "#000000",
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
    dividerColor: DividerColors.DARK,
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
    dividerColor: DividerColors.DARK,
    colorDisabled: "#393e46",
    colorButtonText: "#16151D",
    statusBar: StatusBarStyle.LIGHT,
};

/**
 * TakoTheme
 */

export const takoTheme = {
    id: 8,
    name: "Tako",
    ...PrimaryColors.tako,
    colorAccent: AccentColors.tako,
    rippleColor: RippleColors.tako,
    searchBarColor: "#2A2A3C",
    menuColor: "#484861",
    filterColor: "#FFEB3B",
    dividerColor: DividerColors.DARK,
    colorDisabled: "#484861",
    colorButtonText: "#000000",
    statusBar: StatusBarStyle.LIGHT,
    ...TextColors.dark,
};

/**
 * Yin & Yang
 */

export const yinYangTheme = {
    id: 9,
    name: "Yin & Yang",
    ...PrimaryColors.dark,
    colorAccent: AccentColors.yinYang,
    rippleColor: RippleColors.yinYang,
    searchBarColor: "#303135",
    menuColor: "#484861",
    filterColor: "#FFEB3B",
    dividerColor: DividerColors.DARK,
    colorDisabled: PrimaryColors.dark.colorPrimary,
    colorButtonText: "#000000",
    statusBar: StatusBarStyle.LIGHT,
    ...TextColors.dark,
};

/**
 * Yin & Yang
 */

export const oceanicTheme = {
    id: 6,
    name: "Oceanic",
    ...PrimaryColors.oceanic,
    colorAccent: AccentColors.oceanic,
    rippleColor: RippleColors.oceanic,
    searchBarColor: "#32424A",
    menuColor: "#32424A",
    filterColor: "#FFEB3B",
    dividerColor: DividerColors.DARK,
    colorDisabled: PrimaryColors.oceanic.colorPrimary,
    colorButtonText: "#FFFFFF",
    statusBar: StatusBarStyle.LIGHT,
    ...TextColors.dark,
};

/**
 * Spring Blossom
 */
export const springBlossomTheme = {
    id: 10,
    name: "Spring Blossom",
    ...PrimaryColors.springBlossom,
    ...TextColors.light,
    colorAccent: AccentColors.springBlossom,
    rippleColor: RippleColors.springBlossom,
    searchBarColor: PrimaryColors.springBlossom.colorPrimary,
    menuColor: "#FFFFFF",
    dividerColor: DividerColors.LIGHT,
    filterColor: "#FFC107",
    colorDisabled: PrimaryColors.springBlossom.colorPrimary,
    colorButtonText: "#FFFFFF",
    statusBar: StatusBarStyle.DARK,
};

export const colorsAmoled = {
    ...PrimaryColors.amoled,
    ...TextColors.dark,
    statusBar: StatusBarStyle.LIGHT,
    searchBarColor: "#1F1F1F",
    menuColor: "#242529",
    filterColor: "#FFEB3B",
    dividerColor: "rgba(255,255,255,0.15)",
    colorDisabled: "rgba(33,33,33,255)",
    colorButtonText: "#FFFFFF",
};

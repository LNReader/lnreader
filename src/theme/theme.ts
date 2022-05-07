import {
  AccentColors,
  DividerColors,
  PrimaryColors,
  RippleColors,
  TextColors,
} from './colors';
import { StatusbarStyle } from './types';

/**
 * Light
 */
export const lightTheme = {
  id: 1,
  name: 'Light',
  ...PrimaryColors.light,
  colorPrimary: '#E5ECF4',
  ...TextColors.light,
  colorAccent: AccentColors.default,
  rippleColor: RippleColors.default,
  searchBarColor: '#E5ECF4',
  menuColor: '#E5ECF4',
  dividerColor: DividerColors.LIGHT,
  filterColor: '#FFC107',
  colorDisabled: 'rgba(220,220,220,255)',
  colorButtonText: '#FFFFFF',
  statusBar: StatusbarStyle.DARK,
};

/**
 * Dark
 */
export const darkTheme = {
  id: 2,
  name: 'Dark',
  ...PrimaryColors.dark,
  ...TextColors.dark,
  colorAccent: AccentColors.defaultDark,
  rippleColor: RippleColors.default,
  searchBarColor: '#303135',
  menuColor: '#242529',
  filterColor: '#FFEB3B',
  dividerColor: DividerColors.DARK,
  colorDisabled: PrimaryColors.dark.colorPrimary,
  colorButtonText: '#FFFFFF',
  statusBar: StatusbarStyle.LIGHT,
};

/**
 * Midnight Dusk
 */
export const midnightDuskTheme = {
  id: 3,
  name: 'Midnight Dusk',
  ...PrimaryColors.midnightDusk,
  colorAccent: AccentColors.midnightDusk,
  rippleColor: RippleColors.midnightDusk,
  searchBarColor: '#201F27',
  menuColor: '#201F27',
  filterColor: '#FFEB3B',
  dividerColor: DividerColors.DARK,
  colorDisabled: '#201F27',
  colorButtonText: '#FFFFFF',
  statusBar: StatusbarStyle.LIGHT,
  ...TextColors.dark,
};

/**
 * Lime
 */

export const greenAppleTheme = {
  id: 4,
  name: 'Green Apple',
  ...PrimaryColors.dark,
  ...TextColors.dark,
  colorAccent: AccentColors.greenApple,
  rippleColor: RippleColors.greenApple,
  searchBarColor: '#303135',
  menuColor: '#242529',
  filterColor: '#FFEB3B',
  dividerColor: DividerColors.DARK,
  colorDisabled: 'rgba(57,57,57,255)',
  colorButtonText: '#000000',
  statusBar: StatusbarStyle.LIGHT,
};

/**
 * Strawberry Daiquiri
 */

export const strawberryDaiquiri = {
  id: 7,
  name: 'Strawberry Daiquiri',
  ...PrimaryColors.dark,
  colorAccent: AccentColors.strawberryDaiquiri,
  rippleColor: RippleColors.strawberryDaiquiri,
  searchBarColor: '#303135',
  menuColor: '#242529',
  filterColor: '#FFEB3B',
  dividerColor: DividerColors.DARK,
  colorDisabled: 'rgba(57,57,57,255)',
  colorButtonText: '#FFFFFF',
  statusBar: StatusbarStyle.LIGHT,
  ...TextColors.dark,
};

export const irisBlueTheme = {
  id: 5,
  name: 'Iris Blue',
  ...PrimaryColors.irisBlue,
  ...TextColors.dark,
  colorAccent: AccentColors.irisBlue,
  rippleColor: RippleColors.irisBlue,
  searchBarColor: '#393e46',
  menuColor: '#393e46',
  filterColor: '#FFEB3B',
  dividerColor: DividerColors.DARK,
  colorDisabled: '#393e46',
  colorButtonText: '#16151D',
  statusBar: StatusbarStyle.LIGHT,
};

/**
 * TakoTheme
 */

export const takoTheme = {
  id: 8,
  name: 'Tako',
  ...PrimaryColors.tako,
  colorAccent: AccentColors.tako,
  rippleColor: RippleColors.tako,
  searchBarColor: '#2A2A3C',
  menuColor: '#484861',
  filterColor: '#FFEB3B',
  dividerColor: DividerColors.DARK,
  colorDisabled: '#484861',
  colorButtonText: PrimaryColors.tako.colorPrimaryDark,
  statusBar: StatusbarStyle.LIGHT,
  ...TextColors.dark,
};

/**
 * Yin & Yang
 */

export const yinYangTheme = {
  id: 9,
  name: 'Yin',
  ...PrimaryColors.dark,
  colorAccent: AccentColors.yinYang,
  rippleColor: RippleColors.yinYang,
  searchBarColor: '#303135',
  menuColor: '#484861',
  filterColor: '#FFEB3B',
  dividerColor: DividerColors.DARK,
  colorDisabled: PrimaryColors.dark.colorPrimary,
  colorButtonText: '#000000',
  statusBar: StatusbarStyle.LIGHT,
  ...TextColors.dark,
};

export const yangTheme = {
  id: 11,
  name: 'Yang',
  ...PrimaryColors.light,
  colorAccent: AccentColors.yang,
  rippleColor: RippleColors.yang,
  searchBarColor: '#FFFFFF',
  menuColor: '#484861',
  filterColor: '#FFEB3B',
  dividerColor: DividerColors.LIGHT,
  colorDisabled: PrimaryColors.light.colorPrimary,
  colorButtonText: '#FFFFFF',
  statusBar: StatusbarStyle.DARK,
  ...TextColors.light,
};
/**
 * Yin & Yang
 */

export const oceanicTheme = {
  id: 6,
  name: 'Oceanic',
  ...PrimaryColors.oceanic,
  colorAccent: AccentColors.oceanic,
  rippleColor: RippleColors.oceanic,
  searchBarColor: '#32424A',
  menuColor: '#32424A',
  filterColor: '#FFEB3B',
  dividerColor: DividerColors.DARK,
  colorDisabled: PrimaryColors.oceanic.colorPrimary,
  colorButtonText: '#FFFFFF',
  statusBar: StatusbarStyle.LIGHT,
  ...TextColors.dark,
};

/**
 * Spring Blossom
 */
export const springBlossomTheme = {
  id: 10,
  name: 'Spring Blossom',
  ...PrimaryColors.springBlossom,
  ...TextColors.light,
  colorAccent: AccentColors.springBlossom,
  rippleColor: RippleColors.springBlossom,
  searchBarColor: PrimaryColors.springBlossom.colorPrimary,
  menuColor: '#FFFFFF',
  dividerColor: DividerColors.LIGHT,
  filterColor: '#FFC107',
  colorDisabled: PrimaryColors.springBlossom.colorPrimary,
  colorButtonText: '#FFFFFF',
  statusBar: StatusbarStyle.DARK,
};

export const yotsubaTheme = {
  id: 12,
  name: 'Yotsuba',
  ...PrimaryColors.light,
  ...TextColors.light,
  colorPrimary: '#F6EBE7',
  colorAccent: AccentColors.yotsuba,
  rippleColor: RippleColors.yotsuba,
  searchBarColor: '#F6EBE7',
  menuColor: '#FFFFFF',
  dividerColor: DividerColors.LIGHT,
  filterColor: '#FFC107',
  colorDisabled: PrimaryColors.light.colorPrimary,
  colorButtonText: '#FFFFFF',
  statusBar: StatusbarStyle.DARK,
};

export const takoLightTheme = {
  id: 13,
  name: 'Tako',
  ...PrimaryColors.tako_light,
  ...TextColors.light,
  colorAccent: AccentColors.tako_light,
  rippleColor: RippleColors.tako_light,
  searchBarColor: '#E5DCF4',
  menuColor: '#FFFFFF',
  dividerColor: DividerColors.LIGHT,
  filterColor: '#FFC107',
  colorDisabled: PrimaryColors.tako_light.colorPrimary,
  colorButtonText: '#F3B375',
  statusBar: StatusbarStyle.DARK,
};

export const colorsAmoled = {
  ...PrimaryColors.amoled,
  ...TextColors.dark,
  statusBar: StatusbarStyle.LIGHT,
  searchBarColor: '#000000',
  menuColor: '#242529',
  filterColor: '#FFEB3B',
  dividerColor: 'rgba(255,255,255,0.15)',
  colorDisabled: 'rgba(33,33,33,255)',
  colorButtonText: '#FFFFFF',
};

/**
 * Dark
 */
export const tealTheme = {
  id: 14,
  name: 'Teal',
  ...PrimaryColors.dark,
  ...TextColors.dark,
  colorAccent: AccentColors.teal,
  rippleColor: RippleColors.teal,
  searchBarColor: '#303135',
  menuColor: '#242529',
  filterColor: '#FFEB3B',
  dividerColor: DividerColors.DARK,
  colorDisabled: PrimaryColors.dark.colorPrimary,
  colorButtonText: '#000000',
  statusBar: StatusbarStyle.LIGHT,
};

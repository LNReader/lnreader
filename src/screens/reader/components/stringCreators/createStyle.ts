import { ThemeColors } from '@theme/types';

export const createStyles = (
  currentHeight: number,
  readerSettings: {
    theme: string;
    textColor: string;
    textSize: number;
    textAlign: string;
    padding: number;
    fontFamily: string;
    lineHeight: number;
    customCSS: string;
    customJS: string;
  },
  theme: ThemeColors,
  layoutHeight: number,
  readerPages: boolean,
) => `
<style>
  html {
    scroll-behavior: smooth;
    overflow-x: hidden;
    padding-top: ${currentHeight};
    word-wrap: break-word;
  }
  body {
    padding-bottom: 40px;
    margin-left: 0;
    margin-right: 0;
    font-size: ${readerSettings.textSize}px;
    color: ${readerSettings.textColor};
    text-align: ${readerSettings.textAlign};
    line-height: ${readerSettings.lineHeight};
    font-family: ${readerSettings.fontFamily};
  }
  chapter{
    display: block;
  }
  
  chapter > *{
    padding-left: ${readerSettings.padding}%;
    padding-right: ${readerSettings.padding}%;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  a {
    color: ${theme.primary};
  }
  img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
  }
  img.load-icon {
    display: block;
    margin-inline: auto;
    animation: rotation 1s infinite linear;
  }
  @keyframes rotation {
    100% {
      transform: rotate(360deg);
    }
    0% {
      transform: rotate(0deg);
    }
  }
  #infoContainer {
    padding-left: ${readerSettings.padding}%;
    padding-right: ${readerSettings.padding}%;
  }
  .nextButton,
  .infoText {
    width: 100%;
    border-radius: 50px;
    border-width: 1;
    color: ${theme.onPrimary};
    background-color: ${theme.primary};
    font-family: ${readerSettings.fontFamily};
    font-size: 16px;
    border-width: 0;
  }
  .nextButton {
    min-height: 40px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    padding: 0 16px;
  }
  .infoText {
    background-color: transparent;
    text-align:center;
    border: none;
    margin: 0px;
    color: inherit;
    padding-top: 16px;
    padding-bottom: 16px;
  }
  .chapterCtn {
    min-height: ${layoutHeight - 140};
    margin-bottom: auto;
  }
  ${
    readerPages &&
    `
      body {
        overflow: hidden;
        position: relative;
      }
      #left,
      #right, #middle {
        position: absolute;
        height: 100%;
        width: 35%;
        top: 0;
        z-index: 20
      }
      #middle {
        left: 35%;
        width: 30%;
      }
      #left {
        left: 0;
      }
      #right {
        right: 0;
      }
      #infoContainer {
        position: absolute;
        z-index: 1000;
        bottom: 40;
        width: calc(100% - 2*${readerSettings.padding}%)
      }
      .nextButton{
        position: relative;
        z-index: 100000 !important
      }
      chapter {
        height: 100%;
        display: flexbox;
        flex-direction: column;
        flex-wrap: wrap;
        column-gap: 0;
        column-width: 100vw; 
        transition: 200ms;
      }
      chapter > * {
        width: calc(100% - 2*${readerSettings.padding}%) !important;
      }
      #spacer {
        display: block;
        min-height: 60px;
        width: 100%;
      }
      .hide {
        transform: translate(110%);
        transition: 200ms
      }
      .show {
        transform: translate(0%);
      }
      `
  }
</style>`;

import React from 'react';
import { Dimensions, StatusBar } from 'react-native';
import WebView, { WebViewProps } from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';

import { useTheme } from '@hooks/useTheme';
import { ChapterItem } from '@database/types';
import { useReaderSettings } from '@redux/hooks';
import { getString } from '@strings/translations';

import { sourceManager } from '../../../sources/sourceManager';

type WebViewPostEvent = {
  type: string;
  data?: { [key: string]: string };
};

type WebViewReaderProps = {
  chapterInfo: {
    sourceId: number;
    chapterId: string;
    chapterUrl: string;
    novelId: string;
    novelUrl: string;
    novelName: string;
    chapterName: string;
    bookmark: string;
  };
  html: string;
  chapterName: string;
  swipeGestures: boolean;
  minScroll: React.MutableRefObject<number>;
  nextChapter: ChapterItem;
  webViewRef: React.MutableRefObject<WebView>;
  onPress(): void;
  doSaveProgress(offSetY: number, percentage: number): void;
  navigateToChapterBySwipe(name: string): void;
  onWebViewNavigationStateChange(): void;
  onLayout: WebViewProps['onLayout'];
};

const onClickWebViewPostMessage = (event: WebViewPostEvent) =>
  "onClick='window.ReactNativeWebView.postMessage(`" +
  JSON.stringify(event) +
  "`)'";

const WebViewReader: React.FC<WebViewReaderProps> = props => {
  const {
    chapterInfo,
    html,
    chapterName,
    swipeGestures,
    minScroll,
    nextChapter,
    webViewRef,
    onPress,
    onLayout,
    doSaveProgress,
    navigateToChapterBySwipe,
    onWebViewNavigationStateChange,
  } = props;

  const theme = useTheme();

  const readerSettings = useReaderSettings();
  const { theme: backgroundColor } = readerSettings;

  const layoutHeight = Dimensions.get('window').height;
  const headers = sourceManager(chapterInfo.sourceId)?.headers;
  return (
    <WebView
      ref={webViewRef}
      style={{ backgroundColor }}
      allowFileAccess={true}
      originWhitelist={['*']}
      scalesPageToFit={true}
      showsVerticalScrollIndicator={false}
      onNavigationStateChange={onWebViewNavigationStateChange}
      nestedScrollEnabled={true}
      javaScriptEnabled={true}
      onLayout={onLayout}
      onMessage={ev => {
        const event: WebViewPostEvent = JSON.parse(ev.nativeEvent.data);
        switch (event.type) {
          case 'hide':
            onPress();
            break;
          case 'next':
            navigateToChapterBySwipe('SWIPE_LEFT');
            break;
          case 'prev':
            navigateToChapterBySwipe('SWIPE_RIGHT');
            break;
          case 'imgfile':
            if (event.data && typeof event.data === 'string') {
              RNFetchBlob.fetch('get', event.data, headers).then(res => {
                const base64 = res.base64();
                webViewRef.current?.injectJavaScript(
                  `document.querySelector("img[delayed-src='${event.data}']").src="data:image/jpg;base64,${base64}";
                  document.querySelector("img[delayed-src='${event.data}']").classList.remove("load-icon");
                  sendHeight(500);`,
                );
              });
            }
            break;
          case 'scrollend':
            if (event.data) {
              const offSetY = Number(event.data?.offSetY);
              const percentage = Math.round(Number(event.data?.percentage));
              doSaveProgress(offSetY, percentage);
            }
            break;
          case 'height':
            if (event.data) {
              const contentHeight = Math.round(Number(event.data));
              minScroll.current = (layoutHeight / contentHeight) * 100;
            }
            break;
        }
      }}
      source={{
        html: `
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                    <style>
                      html {
                        scroll-behavior: smooth;
                        overflow-x: hidden;
                        padding-top: ${StatusBar.currentHeight};
                        word-wrap: break-word;
                      }
                      body {
                        padding-left: ${readerSettings.padding}%;
                        padding-right: ${readerSettings.padding}%;
                        padding-bottom: 40px;
                        
                        font-size: ${readerSettings.textSize}px;
                        color: ${readerSettings.textColor};
                        text-align: ${readerSettings.textAlign};
                        line-height: ${readerSettings.lineHeight};
                        font-family: ${readerSettings.fontFamily};
                      }
                      chapter{
                        display: block;
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
                    </style>
                    
                    <style>
                      ${readerSettings.customCSS}
                      
                      @font-face {
                        font-family: ${readerSettings.fontFamily};
                        src: url("file:///android_asset/fonts/${
                          readerSettings.fontFamily
                        }.ttf");
                      }
                    </style>
                  </head>
                  <body>

                    <div class="chapterCtn" ${onClickWebViewPostMessage({
                      type: 'hide',
                    })}>
                      <chapter 
                        data-novel-id='${chapterInfo.novelId}'
                        data-chapter-id='${chapterInfo.chapterId}'
                      >
                        ${html}
                      </chapter>
                    </div>
                    <script>
                    if(!document.querySelector("input[offline]") && ${!!headers}){
                      document.querySelectorAll("img").forEach(img => {
                        window.ReactNativeWebView.postMessage(JSON.stringify({type:"imgfile",data:img.getAttribute("delayed-src")}));
                      });
                    }

                    var scrollTimeout;
                    window.addEventListener("scroll", (event) => {
                      window.clearTimeout( scrollTimeout );
                      scrollTimeout = setTimeout(() => {
                        window.ReactNativeWebView.postMessage(
                          JSON.stringify(
                            {
                              type:"scrollend",
                              data:{
                                offSetY: window.pageYOffset,
                                percentage: (window.pageYOffset+${layoutHeight})/document.body.scrollHeight*100,
                              }
                            }
                          )
                        );
                      }, 100);
                    });

                    let sendHeightTimeout;
                    const sendHeight = (timeOut) => {
                      clearTimeout(sendHeightTimeout);
                      sendHeightTimeout = setTimeout(
                        window.ReactNativeWebView.postMessage(
                          JSON.stringify({type:"height",data:document.body.scrollHeight})
                        ), timeOut
                      );
                    }
                    sendHeight(1000);
                    </script>
                    <div class="infoText">
                    ${getString(
                      'readerScreen.finished',
                    )}: ${chapterName?.trim()}
                    </div>
                    ${
                      nextChapter
                        ? `<button class="nextButton" ${onClickWebViewPostMessage(
                            { type: 'next' },
                          )}>
                      Next: ${nextChapter.chapterName}
                    </button>`
                        : `<div class="infoText">${getString(
                            'readerScreen.noNextChapter',
                          )}</div>`
                    }
                    ${
                      swipeGestures
                        ? `
                        <script>
                          let initialX = null;
                          let initialY = null;
                          document.addEventListener("touchstart", e => {
                            initialX = e.changedTouches[0].screenX;
                            initialY = e.changedTouches[0].screenY;
                          });
                          document.addEventListener("touchend", e => {
                            let diffX = e.changedTouches[0].screenX - initialX;
                            let diffY = e.changedTouches[0].screenY - initialY;
                            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                              e.preventDefault();
                              window.ReactNativeWebView.postMessage(JSON.stringify({type: diffX<0 ? "next" : "prev"}))
                            }
                          });
                          </script>`
                        : ''
                    }

                    <script>
                      async function fn(){${readerSettings.customJS}}
                      document.addEventListener("DOMContentLoaded", fn);
                    </script>
                  </body>
                </html>
                `,
      }}
    />
  );
};

export default WebViewReader;

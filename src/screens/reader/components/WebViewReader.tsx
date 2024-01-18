import React from 'react';
import { Dimensions, StatusBar } from 'react-native';
import WebView, { WebViewProps } from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';
import isEqual from 'react-fast-compare';

import { useTheme } from '@hooks/useTheme';
import { ChapterItem } from '@database/types';
import { useReaderSettings, useSettingsV1 } from '@redux/hooks';
import { getString } from '@strings/translations';

import { sourceManager } from '../../../sources/sourceManager';
import { createHorizontalReaderPages } from './stringCreators/horizontalReaderPages';
import { createStyles } from './stringCreators/createStyle';
import { createSwipeGestures } from './stringCreators/createSwipeGestures';

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
  readerPages: boolean;
  minScroll: React.MutableRefObject<number>;
  pages: React.MutableRefObject<number>;
  nextChapter: ChapterItem;
  webViewRef: React.MutableRefObject<WebView>;
  onPress(): void;
  doSaveProgress(offSetY: number, percentage: number): void;
  navigateToChapterBySwipe(name: string): void;
  onWebViewNavigationStateChange(): void;
  onLayout: WebViewProps['onLayout'];
  scrollToSavedProgress: () => void;
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
    readerPages,
    minScroll,
    nextChapter,
    webViewRef,
    pages,
    onPress,
    onLayout,
    doSaveProgress,
    navigateToChapterBySwipe,
    onWebViewNavigationStateChange,
    scrollToSavedProgress,
  } = props;

  const theme = useTheme();

  const readerSettings = useReaderSettings();
  const { theme: backgroundColor } = readerSettings;
  const { addChapterNameInReader = false } = useSettingsV1();

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
      onLoad={scrollToSavedProgress}
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
          case 'pages':
            if (event.data) {
              pages.current = Number(event.data);
            }
            break;
        }
      }}
      source={{
        html: `
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                    ${createStyles(
                      StatusBar.currentHeight ?? 0,
                      readerSettings,
                      theme,
                      layoutHeight,
                      readerPages,
                    )}
                    
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
                  <body id='sourceId-${chapterInfo.sourceId}'>
                    <div class="chapterCtn" ${
                      !readerPages &&
                      onClickWebViewPostMessage({
                        type: 'hide',
                      })
                    }> 
                      <div id="left"></div>
                      <div id="right"></div>
                      <div id="middle" ${
                        readerPages &&
                        onClickWebViewPostMessage({
                          type: 'hide',
                        })
                      }></div>
                      <chapter 
                        data-page=0
                        data-novel-id='${chapterInfo.novelId}'
                        data-chapter-id='${chapterInfo.chapterId}'
                      >
                        ${
                          addChapterNameInReader
                            ? `<h3>${chapterName}</h3>`
                            : ''
                        }
                        ${html}
                        <p id="spacer"></p>

                      </chapter>
                      <div id="infoContainer" class="hide">
                        <div class="infoText">
                          ${getString(
                            'readerScreen.finished',
                          )}: ${chapterName?.trim()}
                        </div>
                          ${
                            nextChapter
                              ? `<button class="nextButton"  
                                ${onClickWebViewPostMessage({
                                  type: 'next',
                                })}>
                                  Next: ${nextChapter.chapterName}
                                </button>`
                              : `<div class="infoText">${getString(
                                  'readerScreen.noNextChapter',
                                )}</div>`
                          }
                      </div>
                     
                    </div>
                    <script>
                    if(!document.querySelector("input[offline]") && ${!!headers}){
                      document.querySelectorAll("img").forEach(img => {
                        window.ReactNativeWebView.postMessage(JSON.stringify({type:"imgfile",data:img.getAttribute("delayed-src")}));
                      });
                    }
                    var scrollTimeout;
                    ${!readerPages} && window.addEventListener("scroll", (event) => {
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
                          JSON.stringify({type:"height",data: document.body.scrollHeight})
                        ), timeOut
                      );
                    }
                    sendHeight(1000);
                    </script>
                    
                    ${swipeGestures ? createSwipeGestures() : ''}
                    <script>
                      async function fn(){
                        // Position important to prevent layout bugs
                        ${readerPages && createHorizontalReaderPages()}
                        let novelName = "${chapterInfo.novelName}";
                        let chapterName = "${chapterInfo.chapterName}";
                        let sourceId =${chapterInfo.sourceId};
                        let chapterId =${chapterInfo.chapterId};
                        let novelId =${chapterInfo.novelId};
                        let html = document.querySelector("chapter").innerHTML;
                        
                          ${readerSettings.customJS}
                      }
                      document.addEventListener("DOMContentLoaded", fn);
                    </script>
                  </body>
                </html>
                `,
      }}
    />
  );
};
export default React.memo(WebViewReader, isEqual);

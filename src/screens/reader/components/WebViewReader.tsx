import React from 'react';
import { Dimensions, StatusBar } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';

import { useTheme } from '@hooks/useTheme';
import { ChapterInfo } from '@database/types';
import { useReaderSettings } from '@redux/hooks';
import { getString } from '@strings/translations';

import { getPlugin } from '@plugins/pluginManager';

type WebViewPostEvent = {
  type: string;
  data?: { [key: string]: string };
};

type WebViewReaderProps = {
  data: {
    novel: {
      id: string;
      pluginId: string;
      name: string;
    };
    chapter: ChapterInfo;
  };
  html: string;
  chapterName: string;
  swipeGestures: boolean;
  minScroll: React.MutableRefObject<number>;
  nextChapter: ChapterInfo;
  webViewRef: React.RefObject<WebView>;
  onPress(): void;
  onLayout(): void;
  doSaveProgress(offSetY: number, percentage: number): void;
  navigateToChapterBySwipe(name: string): void;
  onWebViewNavigationStateChange({ url }: WebViewNavigation): void;
};

const onClickWebViewPostMessage = (event: WebViewPostEvent) =>
  "onClick='window.ReactNativeWebView.postMessage(`" +
  JSON.stringify(event) +
  "`)'";

const WebViewReader: React.FC<WebViewReaderProps> = props => {
  const {
    data,
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
  const { novel, chapter } = data;
  const readerSettings = useReaderSettings();
  const { theme: backgroundColor } = readerSettings;

  const layoutHeight = Dimensions.get('window').height;
  const plugin = getPlugin(novel?.pluginId);
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
      onLayout={async () => onLayout()}
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
              plugin.fetchImage(event.data).then(base64 => {
                webViewRef.current?.injectJavaScript(
                  `document.querySelector("img[delayed-src='${event.data}']").src="data:image/jpg;base64,${base64}";
                  document.querySelector("img[delayed-src='${event.data}']").classList.remove("load-icon");
                  `,
                );
              });
            }
            break;
          case 'scrollend':
            if (event.data) {
              const percentage = Math.round(Number(event.data?.percentage));
              minScroll.current = Math.round(Number(event.data?.minscroll));
              doSaveProgress(Number(event.data?.offSetY), percentage);
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
                        data-plugin-id='${novel.pluginId}'
                        data-novel-id='${chapter.novelId}'
                        data-chapter-id='${chapter.id}'
                      >
                        ${html}
                      </chapter>
                    </div>
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
                      Next: ${nextChapter.name}
                    </button>`
                        : `<div class="infoText">${getString(
                            'readerScreen.noNextChapter',
                          )}</div>`
                    }
                    <script>
                      const pluginId = '${novel.pluginId}';
                      const novelId = '${chapter.novelId}';
                      const chapterId = '${chapter.id}';
                      if(!document.querySelector("input[offline]") && ${
                        plugin?.protected
                      }){
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
                                  minscroll: ${layoutHeight}/document.body.scrollHeight*100,
                                }
                              }
                            )
                          );
                        }, 100);
                      });
                    </script>
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

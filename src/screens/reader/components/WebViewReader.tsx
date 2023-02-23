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
          case 'imgfiles':
            if (event.data) {
              if (Array.isArray(event.data.imgs)) {
                const promises: Promise<{ data: any; id: number }>[] = [];
                if (event.data.type === 'online') {
                  for (let i = 0; i < event.data.imgs.length; i++) {
                    const { url, id } = event.data.imgs[i];
                    if (url && id) {
                      promises.push(
                        RNFetchBlob.fetch('get', url, headers).then(res => ({
                          data: res.base64(),
                          id: id,
                        })),
                      );
                    }
                  }
                } else {
                  for (let i = 0; i < event.data.imgs.length; i++) {
                    const { url, id } = event.data.imgs[i];
                    if (url && id) {
                      promises.push(
                        RNFetchBlob.fs.readFile(url, 'base64').then(base64 => {
                          return { data: base64, id: id };
                        }),
                      );
                    }
                  }
                }

                Promise.all(promises)
                  .then(datas => {
                    const inject = datas.reduce((p, data) => {
                      return (
                        p +
                        `document.querySelector("img[file-id='${data.id}']").setAttribute("src", "data:image/jpg;base64,${data.data}");
                        document.querySelector("img[file-id='${data.id}']").classList.remove("load-icon");`
                      );
                    }, '');
                    webViewRef.current?.injectJavaScript(
                      inject +
                        'window.requestAnimationFrame(()=>sendHeight());',
                    );
                  })
                  .catch(e => {
                    e; // CloudFlare is too strong :D
                  });
              }
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
                    const isOffline = !!document.querySelector("input[offline]")
                    if(isOffline){
                      imgs = [...document.querySelectorAll("img")].map((img, index)=>{
                        img.setAttribute("file-id", index.toString());
                        return {url:img.getAttribute("file-path"), id:img.getAttribute("file-id")};
                      });
                      window.ReactNativeWebView.postMessage(JSON.stringify({type:"imgfiles",data:{imgs:imgs,type:"offline"}}));
                    }else if(${!!headers}){
                      imgs = [...document.querySelectorAll("img")].map((img, index)=>{
                        img.setAttribute("file-id", index.toString());
                        return {url:img.getAttribute("delayed-src"), id:img.getAttribute("file-id")};
                      });
                      window.ReactNativeWebView.postMessage(JSON.stringify({type:"imgfiles",data:{imgs:imgs,type:"online"}}));
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
                    const sendHeight = () => {
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify(
                          {
                            type:"height",
                            data:document.body.scrollHeight
                          }
                        )
                      );
                    }
                    window.requestAnimationFrame(()=>sendHeight());
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
                          var initialX = null;
                          var initialY = null;
                          document.addEventListener("touchstart", e => {
                            initialX = e.changedTouches[0].screenX;
                            initialY = e.changedTouches[0].screenY;
                          });
                          document.addEventListener("touchend", e => {
                            if (initialX === null || initialY === null) return; 
                            var currentX = e.changedTouches[0].screenX;
                            var currentY = e.changedTouches[0].screenY;
                            var diffX = currentX - initialX;
                            var diffY = currentY - initialY;
                            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                              e.preventDefault();
                              if (diffX < 0) {
                                  window.ReactNativeWebView.postMessage(JSON.stringify({type:"next"}))
                              } else {
                                  window.ReactNativeWebView.postMessage(JSON.stringify({type:"prev"}))
                              }  
                            }
                            initialX = null;
                            initialY = null;
                          });
                          </script>`
                        : ''
                    }
                  </body>
                </html>
                `,
      }}
    />
  );
};

export default WebViewReader;

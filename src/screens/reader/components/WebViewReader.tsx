import React from 'react';
import { Dimensions, StatusBar } from 'react-native';
import WebView, { WebViewProps } from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';

import { useTheme } from '@hooks/useTheme';
import { ChapterItem } from '@database/types';
import { useAppDispatch, useReaderSettings, useSettingsV1 } from '@redux/hooks';
import { setAppSettings } from '@redux/settings/settings.actions';
import { getString } from '@strings/translations';

type WebViewPostEvent = {
  type: string;
  data?: { [key: string]: string };
};

type WebViewReaderProps = {
  chapter: ChapterItem;
  html: string;
  chapterName: string;
  swipeGestures: boolean;
  minScroll: any;
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
    chapter,
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

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { showSwipeMargins } = useSettingsV1();

  const readerSettings = useReaderSettings();
  const { theme: backgroundColor } = readerSettings;

  const layoutHeight = Dimensions.get('window').height;

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
          case 'noswipes':
            dispatch(setAppSettings('showSwipeMargins', false));
            break;
          case 'right':
            navigateToChapterBySwipe('SWIPE_LEFT');
            break;
          case 'left':
            navigateToChapterBySwipe('SWIPE_RIGHT');
            break;
          case 'imgfiles':
            if (event.data) {
              if (Array.isArray(event.data)) {
                const promises: Promise<{ data: any; id: number }>[] = [];
                for (let i = 0; i < event.data.length; i++) {
                  const { url, id } = event.data[i];
                  if (url) {
                    if (id) {
                      promises.push(
                        RNFetchBlob.fs
                          .readFile(url, 'utf8')
                          .then(d => ({ data: d, id })),
                      );
                    } else {
                      // no imageid
                    }
                  }
                }
                Promise.all(promises)
                  .then(datas => {
                    const inject = datas.reduce((p, data) => {
                      return (
                        p +
                        `document.querySelector("img[file-id='${data.id}']").src="data:image/png;base64,${data.data}";`
                      );
                    }, '');
                    webViewRef.current?.injectJavaScript(inject);
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
                      .pos,.posl,.posr {
                        background-color: #ff000055;
                        color: white;
                        position: fixed;
                        z-index: 99;
                        height: 100vh;
                        top: 0;
                        display: none;
                        justify-content: center;
                        align-items:center;
                        width: 100px;
                        font-weight: bold;
                        -webkit-text-stroke-width: 1px;
                        -webkit-text-stroke-color: black;
                      }
                      .posl {
                        background-color: #00ff0055;
                        font-size: 2em;
                        text-align: center;
                      }
                      .posr {
                        background-color: #0000ff55;
                        font-size: 2em;
                        text-align: center;
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
                        data-novel-id='${chapter.novelId}'
                        data-chapter-id='${chapter.chapterId}'
                      >
                        ${html}
                      </chapter>
                    </div>
                    <script>
                    const imgs = [...document.querySelectorAll("img")].map((img, index)=>{
                      img.setAttribute("id", "file-id-" + index);
                      return {url:img.getAttribute("src"), id:img.getAttribute("id")}
                    });
                    window.ReactNativeWebView.postMessage(JSON.stringify({type:"imgfiles",data:imgs}));
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
                    let loadInterval = setInterval(() => {
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify(
                          {
                            type:"height",
                            data:document.body.scrollHeight
                          }
                          )
                        );
                    }, 500);
                    setTimeout(() => {
                      clearInterval( loadInterval );
                    }, 2000);
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
                        ${
                          showSwipeMargins
                            ? `<div class='pos'> </div>
                        <div class='posr'>Swipe Left</div>
                        <div class='posl'>Swipe Right</div>`
                            : ''
                        }
                        <script>
                          const chapter = document.querySelector("chapter");
                          const noswipe = document.querySelector(".pos");
                          const lswipe = document.querySelector(".posl");
                          const rswipe = document.querySelector(".posr");
                          chapter.addEventListener("touchstart", startTouch, false);
                          chapter.addEventListener("touchmove", moveTouch, false);
                          var initialX = null;
                          var initialY = null;
                          function startTouch(e) {
                            initialX = e.touches[0].clientX;
                            initialY = e.touches[0].clientY;
                          };
                          function moveTouch(e) {
                            const width = Math.max(
                              document.body.scrollWidth,
                              document.documentElement.scrollWidth,
                              document.body.offsetWidth,
                              document.documentElement.offsetWidth,
                              document.documentElement.clientWidth
                            );
                            if (initialX === null || initialY === null) return; 
                            var currentX = e.touches[0].clientX;
                            var currentY = e.touches[0].clientY;
                            var diffX = initialX - currentX;
                            var diffY = initialY - currentY;
                            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                              if (diffX > 0) {
                                if(initialX < width/2 - 50)
                                  window.ReactNativeWebView.postMessage(JSON.stringify({type:"left"}))
                              } else {
                                if(initialX > width/2 + 50)
                                  window.ReactNativeWebView.postMessage(JSON.stringify({type:"right"}))
                              }  
                            }
                            initialX = null;
                            initialY = null;
                            e.preventDefault();
                          };
                          
                          ${
                            showSwipeMargins
                              ? `setTimeout(()=>{
                                  const width = Math.max(
                                    document.body.scrollWidth,
                                    document.documentElement.scrollWidth,
                                    document.body.offsetWidth,
                                    document.documentElement.offsetWidth,
                                    document.documentElement.clientWidth
                                  );
                                  noswipe.style.left = width/2-50;
                                  lswipe.style.left = 0;
                                  lswipe.style.width = width/2-50 + "px";
                                  rswipe.style.width = width/2-50 + "px";
                                  rswipe.style.left = width/2+50;
                                  noswipe.style.display = lswipe.style.display = rswipe.style.display = "flex";
                                  window.ReactNativeWebView.postMessage(JSON.stringify({type:"noswipes"}));
                                  setTimeout(()=>{
                                    noswipe.style.display = lswipe.style.display = rswipe.style.display = "none";
                                  }, 1000);
                                }, 250);`
                              : ''
                          }</script>`
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

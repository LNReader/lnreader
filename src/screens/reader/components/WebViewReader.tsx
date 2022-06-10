import { useAppDispatch } from '@redux/hooks';
import { setAppSettings } from '@redux/settings/settings.actions';
import { getString } from '@strings/translations';
import React, { useRef, useEffect, FunctionComponent } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import WebView from 'react-native-webview';
import { ChapterItem } from 'src/database/types';
import { ThemeType } from 'src/theme/types';

import { readerBackground } from '../utils/readerStyles';
import { sanitizeChapterText } from '../utils/sanitizeChapterText';

type WebViewPostEvent = {
  type: string;
  data?: { [key: string]: string };
};

type WebViewReaderProps = {
  html: string;
  theme: ThemeType;
  reader: {
    theme: string;
    textColor: string;
    textSize: number;
    textAlign: string;
    padding: number;
    fontFamily: string;
    lineHeight: number;
    customCSS: string;
  };
  chapterName: string;
  nextChapter: ChapterItem;
  textSelectable: boolean;
  navigateToNextChapter(): void;
  navigateToPrevChapter(): void;
  onPress(): void;
  onScroll(): void;
  onWebViewNavigationStateChange(): void;
  layoutHeight: number;
  webViewScroll: { percentage: number; type: 'smooth' | 'instant' | 'exact' };
  setScrollPercentage: React.Dispatch<React.SetStateAction<number>>;
  scrollPercentage: number;
  swipeGestures: boolean;
  wvShowSwipeMargins: boolean;
  scrollPage: string | null;
  setScrollPage: React.Dispatch<React.SetStateAction<string | null>>;
};

const WebViewReader: FunctionComponent<WebViewReaderProps> = ({
  html,
  theme,
  reader,
  onScroll,
  onWebViewNavigationStateChange,
  layoutHeight,
  webViewScroll,
  nextChapter,
  chapterName,
  onPress,
  navigateToNextChapter,
  navigateToPrevChapter,
  setScrollPercentage,
  scrollPercentage,
  swipeGestures,
  wvShowSwipeMargins,
  scrollPage,
  setScrollPage,
}) => {
  const backgroundColor = readerBackground(reader.theme);

  const chapterText = sanitizeChapterText(html);

  const webViewRef = useRef<WebView>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (scrollPage) {
      if (scrollPage === 'up') {
        webViewRef.current?.injectJavaScript(`(()=>{
          window.scrollTo({top:document.body.scrollTop - ${Math.trunc(
            layoutHeight,
          )},left:0,behavior:'smooth'});
        })()`);
      } else {
        webViewRef.current?.injectJavaScript(`(()=>{
          window.scrollTo({top:document.body.scrollTop + ${Math.trunc(
            layoutHeight,
          )},left:0,behavior:'smooth'});
        })()`);
      }
      setScrollPage(null);
    }
  }, [scrollPage]);

  useEffect(() => {
    if (webViewRef.current && webViewScroll.percentage !== scrollPercentage) {
      webViewRef.current.injectJavaScript(`(()=>{
        const p = ${webViewScroll.percentage};
        const h = document.body.scrollHeight;
        const s = (h*p)/100;
        const lh = ${Math.trunc(layoutHeight)};
        const xs = s - 1.2*lh;
        const type = "${webViewScroll.type}";
        if(type === 'exact')
          window.scrollTo({top: p, left:0, behavior:'smooth'});
        else
          window.scrollTo({top: p === 100 ? h : xs, left:0, behavior:type});
      })()`);
      if (webViewScroll.type !== 'exact') {
        setScrollPercentage(webViewScroll.percentage || 0);
      }
    }
  }, [webViewScroll]);

  const onClickWebViewPostMessage = (event: WebViewPostEvent) =>
    "onClick='window.ReactNativeWebView.postMessage(`" +
    JSON.stringify(event) +
    "`)'";

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={{ backgroundColor }}
        originWhitelist={['*']}
        scalesPageToFit={true}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onNavigationStateChange={onWebViewNavigationStateChange}
        nestedScrollEnabled={true}
        javaScriptEnabled={true}
        onMessage={ev => {
          const event: WebViewPostEvent = JSON.parse(ev.nativeEvent.data);
          // console.log('WVEvent', event);
          switch (event.type) {
            case 'hide':
              onPress();
              break;
            case 'next':
              navigateToNextChapter();
              break;
            case 'prev':
              navigateToPrevChapter();
              break;
            case 'noswipes':
              dispatch(setAppSettings('wvShowSwipeMargins', false));
              break;
            case 'right':
              navigateToNextChapter();
              break;
            case 'left':
              navigateToPrevChapter();
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
                        overflow-x: hidden;
                        padding-top: ${StatusBar.currentHeight};
                        word-wrap: break-word;
                      }
                      body {
                        padding-left: ${reader.padding}%;
                        padding-right: ${reader.padding}%;
                        padding-bottom: 30px;
                        
                        font-size: ${reader.textSize}px;
                        color: ${reader.textColor};
                        text-align: ${reader.textAlign};
                        line-height: ${reader.lineHeight};
                        font-family: ${reader.fontFamily};
                      }
                      hr {
                        margin-top: 20px;
                        margin-bottom: 20px;
                      }
                      a {
                        color: ${theme.colorAccent};
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
                        min-height: 40;
                        border-radius: 50px;
                        padding-vertical: 8;
                        padding-horizontal: 24;
                        border-width: 1;
                        color: ${theme.colorButtonText};
                        background-color: ${theme.colorAccent};
                        font-size: 0.8em;
                      }
                      .infoText {
                        background-color: transparent;
                        text-align:center;
                        border: none;
                        margin: 0px;
                        color: inherit;
                      }
                      .pos,.posl,.posr {
                        background-color: #ff000055;
                        color: blue;
                        position: fixed;
                        z-index: 99;
                        height: 100vh;
                        top: 0;
                        display: none;
                        justify-content: center;
                        align-items:center;
                        width: 100px;
                      }
                      .posl {
                        background-color: #00ff0055;
                        color: red;
                        font-size: 2em;
                        text-align: center;
                      }
                      .posr {
                        background-color: #0000ff55;
                        color: red;
                        font-size: 2em;
                        text-align: center;
                      }
                    </style>
                    
                    <style>
                      ${reader.customCSS}
                      
                      @font-face {
                        font-family: ${reader.fontFamily};
                        src: url("file:///android_asset/fonts/${
                          reader.fontFamily
                        }.ttf");
                      }
                    </style>
                  </head>
                  <body>
                  <!-- You have to use ' or \` in onClick because JSON.stringify() uses " and it would terminate the string! -->
                    <chapter ${onClickWebViewPostMessage({ type: 'hide' })}>
                      ${chapterText}
                    </chapter>
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
                          wvShowSwipeMargins
                            ? `<div class='pos'> </div>
                        <div class='posr'>=></div>
                        <div class='posl'><=</div>`
                            : ''
                        }
                        <script>
                          const chapter = document.querySelector("chapter");
                          const noswipe = document.querySelector(".pos");
                          const lswipe = document.querySelector(".posl");
                          const rswipe = document.querySelector(".posr");
                          // test
                          window.ReactNativeWebView.postMessage('{"type":"test1"}')
                          window.ReactNativeWebView.postMessage(JSON.stringify({type:"test2"}))
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
                            wvShowSwipeMargins
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
    </View>
  );
};

export default WebViewReader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

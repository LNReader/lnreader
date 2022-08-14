import { useAppDispatch } from '@redux/hooks';
import { setAppSettings } from '@redux/settings/settings.actions';
import { getString } from '@strings/translations';
import React, { useRef, useEffect, FunctionComponent } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import WebView from 'react-native-webview';
import { ChapterItem } from '../../../database/types';
import { ThemeType } from '../../../theme/types';

import { readerBackground } from '../utils/readerStyles';

import RNFetchBlob from 'rn-fetch-blob';

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

const WebViewReader: FunctionComponent<WebViewReaderProps> = props => {
  const {
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
  } = props;

  const backgroundColor = readerBackground(reader.theme);

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
        injectedJavaScript={`
        const p = ${webViewScroll.percentage};
        const h = document.body.scrollHeight;
        const s = (h*p)/100;
        const lh = ${Math.trunc(layoutHeight)};
        const xs = s - 1.2*lh;
        const type = "${webViewScroll.type}";
        if(type === 'exact')
          window.scrollTo({top: p, left:0, behavior:'smooth'});
        else
        window.scrollTo({top: p === 100 ? h : xs, left:0, behavior:type});`}
        scalesPageToFit={true}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onNavigationStateChange={onWebViewNavigationStateChange}
        nestedScrollEnabled={true}
        javaScriptEnabled={true}
        onMessage={ev => {
          const event: WebViewPostEvent = JSON.parse(ev.nativeEvent.data);
          // console.log('WVEvent:', event);
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
            case 'imgfiles':
              if (event.data) {
                if (Array.isArray(event.data)) {
                  const promises: Promise<{ data: any; id: number }>[] = [];
                  for (let i = 0; i < event.data.length; i++) {
                    const { url, id } = event.data[i];
                    // console.log(url, id);
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
                  Promise.all(promises).then(datas => {
                    const inject = datas.reduce((p, data) => {
                      // console.log(
                      //   `document.querySelector("img[file-id='${data.id}']").src="data:image/png;base64,`,
                      // );
                      return (
                        p +
                        `document.querySelector("img[file-id='${data.id}']").src="data:image/png;base64,${data.data}";`
                      );
                    }, '');
                    webViewRef.current?.injectJavaScript(inject);
                  });
                }
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
                        border-radius: 50px;
                        border-width: 1;
                        color: ${theme.colorButtonText};
                        background-color: ${theme.colorAccent};
                        font-family: ${reader.fontFamily};
                        font-size: 16px;
                        border-width: 0;
                      }
                      .nextButton {
                        min-height: 40px
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
                    <chapter ${onClickWebViewPostMessage({ type: 'hide' })}>
                      ${html}
                    </chapter>
                    <script>
                    const imgs = [...document.querySelectorAll("img")].map(img=>{
                      return {url:img.getAttribute("file-src"), id:img.getAttribute("file-id")}
                    });
                    window.ReactNativeWebView.postMessage(JSON.stringify({type:"imgfiles",data:imgs}));
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
                          wvShowSwipeMargins
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

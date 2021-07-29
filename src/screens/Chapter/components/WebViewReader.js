import React from "react";
import WebView from "react-native-webview";

export const WebViewReader = ({ style, css, text, onScroll }) => (
    <WebView
        style={style}
        originWhitelist={["*"]}
        scalesPageToFit={true}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        source={{
            html: `
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <style>
       ${css}
    </style>
    </head>
<body>
    ${text}
</body>
</html>
`,
        }}
    />
);

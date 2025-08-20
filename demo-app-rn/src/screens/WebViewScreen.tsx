// src/screens/WebViewScreen.tsx
import React, { useRef, useMemo } from 'react';
import { View } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { FinvuAuthenticationWebviewWrapper, FinvuAuthEnvironment } from '@cookiejar-technologies/finvu-auth-sdk-rn';
import { styles } from '../styles/styles';

const WEB_APP_URL = 'https://test-web-app-8a50c.web.app'; // change as needed

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);

  // memoize wrapper so it isn't recreated on every render
  const finvuWrapper = useMemo(
    () => new FinvuAuthenticationWebviewWrapper(FinvuAuthEnvironment.DEVELOPMENT),
    []
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    finvuWrapper.handleMessage(event, webViewRef);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        onMessage={handleMessage}
        javaScriptEnabled
      // injectedJavaScript={} // optional
      />
    </View>
  );
}

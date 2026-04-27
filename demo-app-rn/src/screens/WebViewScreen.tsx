// src/screens/WebViewScreen.tsx
import React, { useRef, useMemo, useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { FinvuAuthenticationWebviewWrapper, FinvuAuthEnvironment } from '@cookiejar-technologies/finvu-auth-sdk-rn';
import { styles, inputProps, inputStyles } from '../styles/styles';

const DEFAULT_URL = 'https://reactjssdk.finvu.in/?ecreq=5ze4EGbbbeqYinPf-GZb0LJuQgBsBMEaMIw6OLW7nE32dqpt3g_LCKzRH9GHj0nu_tcBP8uWpzKfblw40UtJ6IFiGbpN7xD9VwBzowLulpVbbtm_UAjEfN3ZN59oYZBJtmsSEaR9BwmW-S6r6UlctZ_aff5BmiiBYg4-nuKevbO1V_XKkr9_UrOqyQQDKSoIqSAvNfAkZ0L-PfEctOkKeSVlWEuu4DJFtM30_Jh5DbY%3D&reqdate=260420261911063&fi=VF9FdFZYU1hQSUNQSVlUUw%3D%3D&fip=QkFSQjBLSU1YWFg%3D';

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const [webUrl, setWebUrl] = useState(DEFAULT_URL);
  const [loadedUrl, setLoadedUrl] = useState('');
  const [showWebView, setShowWebView] = useState(false);

  // memoize wrapper so it isn't recreated on every render
  const finvuWrapper = useMemo(
    () => new FinvuAuthenticationWebviewWrapper(FinvuAuthEnvironment.DEVELOPMENT),
    []
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    finvuWrapper.handleMessage(event, webViewRef);
  };

  const handleLoadWebView = () => {
    if (webUrl.trim()) {
      setLoadedUrl(webUrl.trim());
      setShowWebView(true);
    }
  };

  if (showWebView && loadedUrl) {
    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: loadedUrl }}
          onMessage={handleMessage}
          javaScriptEnabled
        />
      </View>
    );
  }

  return (
    <View style={styles.containerPadded}>
      <View style={styles.gap} />
      <Text style={styles.label}>WebView URL</Text>
      <TextInput
        {...inputProps}
        style={inputStyles.input}
        value={webUrl}
        onChangeText={setWebUrl}
        placeholder="Enter WebView URL"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.gap} />
      <Button 
        title="Load WebView" 
        onPress={handleLoadWebView}
        disabled={!webUrl.trim()}
      />
    </View>
  );
}

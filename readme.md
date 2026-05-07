# Finvu Auth SDK — React Native

**Package:** `@io.github.cookiejar-technologies/finvu-auth-sdk-rn`  
**Version:** `1.0.0` · **React Native:** 0.70+ · **iOS:** 16.0+ · **Android:** API 25+

Silent Network Authentication (SNA) SDK for React Native, with WebView bridge support for web-based authentication flows.

> This is a bare React Native module. It works in any bare React Native app. For Expo apps, use a custom development build — **not Expo Go**.

---

## Installation

```bash
npm install @io.github.cookiejar-technologies/finvu-auth-sdk-rn
```

No additional native configuration is needed — the SDK is autolinked.

---

## Platform Setup

### Android

#### 1. Internet & Network Permissions

Add to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
```

#### 2. Network Security Config

Add to your `<application>` tag in `AndroidManifest.xml`:

```xml
<application
    android:networkSecurityConfig="@xml/finvu_silent_network_authentication_network_security_config"
    ...>
</application>
```

> Required for Silent Network Authentication (SNA) to make carrier-specific HTTP calls.

---

### iOS

Run pod install after `npm install`:

```bash
cd ios && pod install --repo-update
```

#### Info.plist — Network Security

Add the following to your `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>80.in.safr.sekuramobile.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key><true/>
            <key>NSIncludesSubdomains</key><true/>
        </dict>
        <key>api-csp.airtel.in</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key><true/>
            <key>NSIncludesSubdomains</key><true/>
        </dict>
        <key>in-vil.ipification.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key><true/>
            <key>NSIncludesSubdomains</key><true/>
        </dict>
        <key>partnerapi.jio.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key><true/>
            <key>NSIncludesSubdomains</key><true/>
        </dict>
    </dict>
</dict>
```

---

## Integration

### Option A — WebView App

Use this if your app loads a web page inside a React Native `WebView` and the web app drives the authentication flow.

```tsx
import React, { useEffect, useRef } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import {
  FinvuAuthEnvironment,
  FinvuAuthenticationWebviewWrapper,
} from '@io.github.cookiejar-technologies/finvu-auth-sdk-rn';

export default function AuthScreen({ url }: { url: string }) {
  const webViewRef = useRef<WebView>(null);
  const wrapperRef = useRef<FinvuAuthenticationWebviewWrapper | null>(null);

  useEffect(() => {
    wrapperRef.current = new FinvuAuthenticationWebviewWrapper(
      FinvuAuthEnvironment.PRODUCTION,  // or DEVELOPMENT
    );
    return () => {
      wrapperRef.current?.cleanupAll();
    };
  }, []);

  const handleMessage = (event: WebViewMessageEvent) => {
    wrapperRef.current?.handleMessage(event, webViewRef);
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: url }}
      onMessage={handleMessage}
      javaScriptEnabled
    />
  );
}
```

Your web app communicates with the SDK by posting messages via `window.ReactNativeWebView.postMessage`.

---

### Option B — Native App

Use this if your app handles the authentication flow entirely in React Native, without a WebView.

```typescript
import {
  FinvuAuthEnvironment,
  FinvuAuthSdkInstance,
} from '@io.github.cookiejar-technologies/finvu-auth-sdk-rn';

// 1. Setup — call once on mount
FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.PRODUCTION);

// 2. Init — call with requestId from your backend
const initResult = await FinvuAuthSdkInstance.initAuth({
  requestId: 'YOUR_REQUEST_ID',
});

// 3. Start SNA — call with the SNA URL returned by your backend
const authResult = await FinvuAuthSdkInstance.startAuth('SNA_URL');
// auth complete — use authResult.token

// 4. Cleanup — call when done or user exits
FinvuAuthSdkInstance.cleanupAll();
```


## Demo App

See [`BareDemoApp/`](./BareDemoApp) for a complete bare React Native working example.


## Support

support@cookiejar.co.in · [finvu.in](https://finvu.in)

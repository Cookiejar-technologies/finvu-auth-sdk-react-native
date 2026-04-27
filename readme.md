# Finvu Auth SDK — React Native

React Native 0.70+ · iOS 15.1+ · Android API 25+

Package: `@cookiejar-technologies/finvu-auth-sdk-rn`

---

## Installation

**Configure `.npmrc`** to pull from GitHub Packages:
```
@cookiejar-technologies:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
```

**Install:**
```bash
npm install @cookiejar-technologies/finvu-auth-sdk-rn@2.0.1
```

**Android** — add to `AndroidManifest.xml` inside the `<application>` tag:
```xml
<application
    android:networkSecurityConfig="@xml/finvu_silent_network_authentication_network_security_config"
    ...>
</application>
```
> Required for Silent Network Authentication (SNA).

**iOS** — add to `Info.plist` for Silent Network Authentication:
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

```bash
cd ios && pod install --repo-update
```

---

## Integration

There are two ways to integrate depending on your app type.

---

### Option A — WebView App

Use this if your app renders a web app inside a React Native `WebView`. The SDK handles messages posted by your web app.

```typescript
import { useRef } from 'react';
import { WebView } from 'react-native-webview';
import {
  FinvuAuthEnvironment,
  FinvuAuthenticationWebviewWrapper,
} from '@cookiejar-technologies/finvu-auth-sdk-rn';

const wrapper = new FinvuAuthenticationWebviewWrapper(FinvuAuthEnvironment.PRODUCTION);
const webViewRef = useRef(null);

<WebView
  ref={webViewRef}
  source={{ uri: 'https://your-web-app' }}
  onMessage={(event) => wrapper.handleMessage(event, webViewRef)}
/>
```

Your web app communicates with the SDK via `window.ReactNativeWebView.postMessage`.

---

### Option B — Native App

Use this if your app handles auth entirely in React Native, without a WebView.

```typescript
import {
  FinvuAuthEnvironment,
  FinvuAuthSdkInstance,
} from '@cookiejar-technologies/finvu-auth-sdk-rn';

// 1. Setup — call once on mount
FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.PRODUCTION);

// 2. Init — call with requestId from your backend session
const initResult = await FinvuAuthSdkInstance.initAuth({
  requestId: 'REQUEST_ID',
});

// 3. Start SNA — call with the SNA URL returned by your backend
const authResult = await FinvuAuthSdkInstance.startAuth('SNA_URL');
// auth complete — use authResult.token

// 4. Cleanup — call when done or user exits the flow
FinvuAuthSdkInstance.cleanupAll();
```

---



Need help? Contact support@cookiejar.co.in

# Finvu Auth SDK — React Native

React Native 0.70+ · iOS 16.0+ · Android API 25+

Package: `@cookiejar-technologies/finvu-auth-sdk-rn`

---

## Installation

```bash
npm install @cookiejar-technologies/finvu-auth-sdk-rn@2.0.20
```

---

## Platform Setup

### Android

#### 1. Add GitHub Packages Repository

Add to your **project-level** `build.gradle` or `settings.gradle.kts`:

```gradle
maven {
    url = uri("https://maven.pkg.github.com/Cookiejar-technologies/finvu-auth-sdk-android")
    credentials {
        username = project.findProperty("gpr.user") as String? ?: System.getenv("USERNAME")
        password = project.findProperty("gpr.key") as String? ?: System.getenv("TOKEN")
    }
}
```

#### 2. Add GitHub Credentials

Create or edit `~/.gradle/gradle.properties` (do **not** commit this file):

```properties
gpr.user=YOUR_GITHUB_USERNAME
gpr.key=YOUR_GITHUB_PAT
```

> To create a GitHub Personal Access Token (PAT):
> 1. Go to [GitHub Token Settings](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
> 2. Generate a new token with `read:packages` scope
> 3. Copy and save it securely

#### 3. Configure Network Security

Add to your `AndroidManifest.xml` inside the `<application>` tag:

```xml
<application
    android:networkSecurityConfig="@xml/finvu_silent_network_authentication_network_security_config"
    ...>
</application>
```

> Required for Silent Network Authentication (SNA). [Learn more](https://docs.google.com/document/d/1TQndJJ1IvKAEt5aZxJE-EL156-Zw3e2RfhS7K-NgXHk/edit?usp=sharing)

---

### iOS

#### 1. Update your `Podfile`

```ruby
platform :ios, '16.0'

# Add Finvu SDK dependency
pod 'FinvuAuthenticationSDK', :git => 'https://github.com/Cookiejar-technologies/finvu-auth-sdk-ios.git', :tag => '1.0.3'
```

> Latest iOS SDK version is `1.0.3`

#### 2. Install pods

```bash
cd ios && pod install --repo-update
```

#### 3. Configure `Info.plist`

Add the following for Silent Network Authentication:

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

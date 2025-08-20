# Finvu Auth SDK — React Native

The Finvu Auth SDK for React Native is a headless authentication solution that provides seamless integration with Finvu's authentication services.

## 📝 Overview

The SDK offers two integration approaches:
1. **WebView Integration**: Embed your web authentication flow using React Native WebView
2. **Native UI Integration**: Build custom native UIs using the SDK's JavaScript APIs

Being headless by design, the SDK gives you complete control over the UI implementation while handling all the complex authentication logic internally. It provides built-in support for Silent Network Authentication (SNA), allowing for a seamless authentication experience when conditions are met.

## ✨ Features

- 🎯 **Headless Design**: Full control over UI implementation
- 🌐 **Dual Integration Options**: WebView or Native UI
- 🔄 **Silent Authentication**: Automatic SIM-based authentication
- 📱 **Cross-Platform**: iOS and Android support
- 🚀 **Expo Compatible**: Works in both bare and managed workflows

## 🛠 Development Setup

### Prerequisites

- Node.js (v16 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed globally
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835) (for iOS development)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- A physical device or emulator for testing

## 📦 Package Information

```markdown
Package:     @cookiejar-technologies/finvu-auth-sdk-rn
Platforms:   iOS 16.0+ · Android API 25+ (7.1)
React Native: 0.71+ (tested on 0.79)
Dependencies: react-native-webview*, react, react-native

* Required only for WebView integration
```

---

## 📋 Requirements

* **React Native**: 0.71+
* **iOS**: 16.0+, Xcode 14+
* **Android**: API 25+
* **WebView**: `npm module react-native-webview`

---

## 📦 Installation

### GitHub Packages setup

This SDK is published to **GitHub Packages** under the Cookiejar org.  
You need a GitHub **Personal Access Token (classic)** with `read:packages` scope.

1. Create `~/.npmrc` (global) or add to your project `.npmrc`:
```
    @cookiejar-technologies:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
```

2. Login via npm:
```
    npm login --registry=https://npm.pkg.github.com --scope=@cookiejar-technologies
```

3. Install the sdk. 
```
    npm install @cookiejar-technologies/finvu-auth-sdk-rn@latest-react-native-sdk-version
```

> Note : latest react-native-sdk-version is 1.0.0

### Expo Managed Workflow

Prebuild your Expo app. This step is necessary to generate the native `android` and `ios` directories so you can apply the required native SDK configurations:
```bash
# Run this command in your project directory
npx expo prebuild
```

> **Note**: For more details on prebuilding and its implications, see the [official Expo prebuild documentation](https://docs.expo.dev/workflow/continuous-native-generation/)

### Platform Setup

#### Android Configuration

1. Add GitHub Packages Repository
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

2. Add GitHub Credentials
Create or edit `~/.gradle/gradle.properties` (do **not** commit this file):

```properties
gpr.user=YOUR_GITHUB_USERNAME
gpr.key=YOUR_GITHUB_PAT
```

> To create a GitHub Personal Access Token (PAT):
> 1. Visit [GitHub's Token Settings](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
> 2. Generate a new token with `read:packages` scope
> 3. Copy and save the token securely

3. Configure Network Security
Add to your `AndroidManifest.xml` in the `<application>` tag:

```xml
<application
    ...
    android:networkSecurityConfig="@xml/finvu_silent_network_authentication_network_security_config"
    ... >
</application>
```

> This configuration is required for Silent Network Authentication (SNA). [Learn more about SNA configuration](https://docs.google.com/document/d/1TQndJJ1IvKAEt5aZxJE-EL156-Zw3e2RfhS7K-NgXHk/edit?usp=sharing)

#### iOS Configuration

1. Update your `Podfile`:

```ruby
# Set minimum iOS version
platform :ios, '16.0'
    
# Add Finvu SDK dependency
pod 'FinvuAuthenticationSDK', :git => 'https://github.com/Cookiejar-technologies/finvu-auth-sdk-ios.git', :tag => 'latest-ios-sdk-version'
```

> Note : latest latest-ios-sdk-version is v1.0.1

2. Install pods:
```bash
cd ios && pod install --repo-update
```

3. Configure `Info.plist`
Add the following to enable Silent Network Authentication:

```xml
<key>NSAllowsArbitraryLoads</key>
<true/>
<key>NSExceptionDomains</key>
<dict>
    <key>80.in.safr.sekuramobile.com</key>
    <dict>
        <key>NSIncludesSubdomains</key>
        <true/>
        <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
        <true/>
        <key>NSTemporaryExceptionMinimumTLSVersion</key>
        <string>TLSv1.1</string>
    </dict>
    <key>partnerapi.jio.com</key>
    <dict>
        <key>NSIncludesSubdomains</key>
        <true/>
        <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
        <true/>
        <key>NSTemporaryExceptionMinimumTLSVersion</key>
        <string>TLSv1.1</string>
    </dict>
</dict>
```

> This configuration is required for Silent Network Authentication (SNA). [Learn more about SNA configuration](https://docs.google.com/document/d/1TQndJJ1IvKAEt5aZxJE-EL156-Zw3e2RfhS7K-NgXHk/edit?usp=sharing)

After setup:

* iOS: `cd ios && pod install`
* Android: Gradle sync will pick it up

---

## � Code Guidelines

### 1. Keep Authentication Flow Clean

Authentication screens should only contain authentication-related logic. Avoid mixing analytics, tracking, or unrelated API calls.

```tsx
// ❌ Avoid
function AuthScreen() {
  useEffect(() => {
    Analytics.track('auth_screen'); // ❌ No analytics in auth flow
    ThirdPartyAPI.fetch();         // ❌ No unrelated API calls
    setupAuth();
  }, []);
}

// ✅ Recommended
function AuthScreen() {
  useEffect(() => {
    setupAuth(); // ✅ Only authentication setup
    return () => cleanupAll();
  }, []);
}
```

### 2. Secure Data Handling

Never store sensitive authentication data in local storage:

```tsx
// ❌ Avoid
const storeAuthData = async (token: string) => {
  await AsyncStorage.setItem('auth_token', token); // ❌ Don't store sensitive data
}

// ✅ Recommended
const handleAuthSuccess = (token: string) => {
  // Pass token to parent component or navigation
  navigation.navigate('Home', { token }); // ✅ Pass as parameter
}
```

### 3. Clean Up Resources

Always clean up SDK resources and state when the authentication flow ends:

```tsx
function AuthScreen() {
  useEffect(() => {
    // Setup
    FinvuAuthenticationWrapper.setup({/*...*/});
    
    return () => {
      // Cleanup on unmount
      cleanupAll();
      resetState();
    };
  }, []);

  // Handle back navigation
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        cleanupAll();
        navigation.goBack();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );
}
```

### 4. Prevent Duplicate Requests

Guard against multiple simultaneous authentication attempts:

```tsx
function AuthButton() {
  const [isAuthInProgress, setAuthInProgress] = useState(false);
  
  const startAuth = async () => {
    if (isAuthInProgress) return; // Prevent duplicate calls
    
    try {
      setAuthInProgress(true);
      await startAuthFlow();
    } finally {
      setAuthInProgress(false);
    }
  };
  
  return (
    <Button 
      onPress={startAuth}
      disabled={isAuthInProgress}
      title="Authenticate"
    />
  );
}
```

### 5. Handle App State Changes

Clean up authentication state when the app goes to background or auth journey ends:

```tsx
// For WebView Integration
function WebViewAuthScreen() {
  const finvuWrapper = useMemo(() => 
    new FinvuAuthenticationWebviewWrapper(FinvuAuthEnvironment.PRODUCTION), 
    []
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        // Clean up WebView wrapper when app goes to background
        finvuWrapper.cleanupAll();
        resetAuthState();
      }
    });

    return () => {
      subscription.remove();
      finvuWrapper.cleanupAll(); // Clean up WebView wrapper
    };
  }, [finvuWrapper]);
}

// For Native UI Integration
function NativeAuthScreen() {
  useEffect(() => {
    FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.PRODUCTION);
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        // Clean up native instance when app goes to background
        FinvuAuthSdkInstance.cleanupAll();
        resetAuthState();
      }
    });

    return () => {
      subscription.remove();
      FinvuAuthSdkInstance.cleanupAll(); // Clean up native instance
    };
  }, []);
}
```

---

## �🚀 Usage

### 1. WebView Integration

The WebView integration allows you to embed your web-based authentication flow within your React Native app. This approach requires the `react-native-webview` package:

```bash
# Install WebView dependency if not already installed
npm install react-native-webview
```

Then, set up your WebView component with the SDK wrapper:

```tsx
import React, { useRef, useMemo } from 'react';
import { View } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { 
  FinvuAuthenticationWebviewWrapper, 
  FinvuAuthEnvironment 
} from '@cookiejar-technologies/finvu-auth-sdk-rn';

function AuthWebViewScreen() {
  const webViewRef = useRef<WebView>(null);

  // Create a memoized wrapper instance
  const finvuWrapper = useMemo(
    () => new FinvuAuthenticationWebviewWrapper(FinvuAuthEnvironment.PRODUCTION),
    []
  );

  // Handle WebView messages
  const handleMessage = (event: WebViewMessageEvent) => {
    finvuWrapper.handleMessage(event, webViewRef);
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView 
        ref={webViewRef}
        source={{ uri: 'https://your-web-app' }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
      />
    </View>
  );
}
```

### 2. Native UI Integration

Use the native wrapper instance for building custom authentication UIs without WebView:

```tsx
import { 
  FinvuAuthSdkInstance,
  FinvuAuthEnvironment,
  type FinvuAuthSuccessResponse,
  type FinvuAuthFailureResponse
} from '@cookiejar-technologies/finvu-auth-sdk-rn';

function NativeAuthScreen() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Setup SDK on mount
  useEffect(() => {
    FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.PRODUCTION);
    
    // Cleanup when component unmounts
    return () => {
      try {
        FinvuAuthSdkInstance.cleanupAll();
      } catch (e) {
        console.error('Cleanup failed:', e);
      }
    };
  }, []);

  const initializeSDK = async () => {
    try {
      setLoading(true);
      
      const initConfig = {
        appId: 'YOUR_APP_ID',
        requestId: 'REQUEST_ID'
      };
      
      const initResponse = await FinvuAuthSdkInstance.initAuth(initConfig);
      
      if (initResponse.status === 'FAILURE') {
        console.error('Init failed:', initResponse.error.errorMessage);
        return false;
      }
      
      return true; // Initialization successful
    } catch (error) {
      console.error('Init failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const startAuthentication = async () => {
    try {
      setLoading(true);
      
      const authResponse = await FinvuAuthSdkInstance.startAuth('9876543210');
      
      if (authResponse.status === 'FAILURE') {
        console.error('Auth failed:', authResponse.error.errorMessage);
        return;
      }
      
      // Handle success
      setToken(authResponse.token);
      
    } catch (error) {
      console.error('Auth failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async () => {
    const isInitialized = await initializeSDK();
    if (isInitialized) {
      await startAuthentication();
    }
  };

  return (
    <View>
      <Button 
        title="Authenticate"
        onPress={handleAuthentication}
        disabled={loading} 
      />
      {token && <Text>Auth Success! Token: {token}</Text>}
    </View>
  );
}
```


## Environment Configuration

The SDK provides two environment configurations:

```typescript
// Development: Use during development for:
FinvuAuthEnvironment.DEVELOPMENT

// Production: Use for app releases:
FinvuAuthEnvironment.PRODUCTION
```

> **Important**: Always use `DEVELOPMENT` environment while developing and debugging your app. Switch to `PRODUCTION` environment before building your app for release to ensure optimal performance and security.

Example usage:
```typescript
// During development
FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.DEVELOPMENT);

// For production release
FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.PRODUCTION);
```
---

## 🌐 WebView/JavaScript API

### Bridge Polyfill Setup

First, add this polyfill to your web app to enable communication with the native SDK:

```javascript
// Bridge polyfill for React Native WebView
if (typeof window !== "undefined" && !window.finvu_authentication_bridge) {
  window.finvu_authentication_bridge = {
    initAuth: function (initConfig, callback) {
      const message = {
        method: "initAuth",
        initConfig,
        callback,
      };
      if (window.ReactNativeWebView?.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      } else {
        console.warn("React Native WebView bridge not available");
      }
    },

    startAuth: function (phoneNumber, callback) {
      const message = {
        method: "startAuth",
        phoneNumber,
        callback,
      };
      if (window.ReactNativeWebView?.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      } else {
        console.warn("React Native WebView bridge not available");
      }
    }
  };
}
```

### Response Handlers Setup

Setup response handlers to receive callbacks from the native SDK:

```typescript
import { useState, useEffect } from "react";

function AuthenticationComponent() {
  const [status, setStatus] = useState<string>("");
  
  useEffect(() => {
    // Init Auth Response Handler
    window.handleInitAuthResponse = (response) => {
      try {
        const data = JSON.parse(response);
        if (data.error) {
          console.error('Init Auth Error:', data.error);
          setStatus(`Init Failed: ${data.error.errorMessage}`);
        } else {
          console.log('Init Success:', data);
          setStatus('Initialized');
        }
      } catch (error) {
        console.error('Init Parse Error:', error);
      }
    };

    // Start Auth Response Handler
    window.handleStartAuthResponse = (response) => {
      try {
        const data = JSON.parse(response);
        if (data.error) {
          console.error('Auth Error:', data.error);
          setStatus(`Auth Failed: ${data.error.errorMessage}`);
        } else {
          console.log('Auth Success:', data);
          setStatus(`Authenticated: ${data.token}`);
        }
      } catch (error) {
        console.error('Auth Parse Error:', error);
      }
    };

    // Cleanup handlers on unmount
    return () => {
      delete window.handleInitAuthResponse;
      delete window.handleStartAuthResponse;
    };
  }, []);

  return <div>{status}</div>;
}
```

### Using the Bridge

Example of how to use the bridge methods:

```typescript
function AuthenticationFlow() {
  const startAuthentication = () => {
    try {
      // 1. Initialize SDK
      const initConfig = {
        appId: "YOUR_APP_ID",
        requestId: "REQUEST_ID"
      };
      
      window.finvu_authentication_bridge.initAuth(
        JSON.stringify(initConfig),
        "handleInitAuthResponse"
      );
    } catch (error) {
      console.error("Init failed:", error);
    }
  };

  const handlePhoneSubmit = (phoneNumber: string) => {
    try {
      // 2. Start authentication
      window.finvu_authentication_bridge.startAuth(
        phoneNumber,
        "handleStartAuthResponse"
      );
    } catch (error) {
      console.error("Auth failed:", error);
    }
  };

  return (
    <div>
      <button onClick={startAuthentication}>
        Initialize SDK
      </button>
      
      <input 
        type="tel" 
        onChange={(e) => handlePhoneSubmit(e.target.value)} 
      />
    </div>
  );
}
```

### Bridge Communication Flow

1. **Message Format**:
   - All messages sent through the bridge must be stringified JSON
   - Each method call requires a callback function name
   - Responses are received through the registered callback functions

2. **Bridge Detection**:
   - The polyfill checks for React Native WebView bridge availability
   - Uses `window.ReactNativeWebView.postMessage` for communication
   - Falls back gracefully with warning if bridge is not available

3. **Response Handling**:
   - All responses are received as stringified JSON
   - Success response format: `{ status: 'SUCCESS', token?, ...otherData }`
   - Error response format: `{ error: { status: 'FAILURE', errorCode?, errorMessage? } }`
   - Always use try-catch when parsing responses

4. **Cleanup**:
   - Remove response handlers when component unmounts
   - Clear any auth-related state
   - Handle error cases appropriately

## 📤 Types Reference

```typescript
// Success Response
type FinvuAuthSuccessResponse = { 
  status: 'SUCCESS';
  token?: string;      // Authentication token
  authType?: string;   // Authentication method used
} & Record<string, unknown>;  // Additional fields

// Failure Response
type FinvuAuthFailureResponse = { 
  error: {
    status: 'FAILURE';
    errorCode?: string;
    errorMessage?: string;
    [k: string]: unknown;  // Additional error details
  }
};

// SDK Instance Interface
interface IFinvuAuthSdk {
  setup(env: FinvuAuthEnvironment): void;
  initAuth(initConfig: object | string): Promise<FinvuAuthSuccessResponse | FinvuAuthFailureResponse>;
  startAuth(phoneNumber: string): Promise<FinvuAuthSuccessResponse | FinvuAuthFailureResponse>;
  cleanupAll(): void;
}

// Environment Options
enum FinvuAuthEnvironment {
  PRODUCTION = "PRODUCTION",
  DEVELOPMENT = "DEVELOPMENT"
}
```

### Status Types

| Status  | Description                     | Next Action              |
|---------|--------------------------------|-------------------------|
| SUCCESS | Authentication successful       | Use token for API calls |
| FAILURE | Authentication failed          | Handle error, retry     |

### Error Codes

| Code | Meaning           | Common Causes                          |
|------|------------------|----------------------------------------|
| 1001 | Invalid parameter| Missing appId/requestId, bad phone/OTP |
| 1002 | Generic failure  | Network issues, SNA failure            |

---

## ❓ FAQ & Troubleshooting

### Silent Network Authentication (SNA)

**Q: What conditions are required for SNA to work?**
A: For SNA to work properly:
- Device must have mobile data enabled (SIM internet ON)
- WiFi should be disabled
- SIM card must support required network protocols
- Device must have active mobile network connectivity

### Common Issues

1. **Android Setup**
   - Verify GitHub Maven repo credentials in project `build.gradle`
   - Confirm network security config is added to `AndroidManifest.xml`
   - Check if the GitHub PAT has `read:packages` scope
   - Run `./gradlew clean` after setup changes

2. **iOS Setup**
   - Run `pod install --repo-update` after SDK installation
   - Verify ATS exceptions in `Info.plist` for SNA domains
   - Ensure minimum iOS 16.0 deployment target
   - Check Podfile uses correct SDK version

3. **WebView Integration**
   - Check bridge method names match exactly
   - Verify WebView settings (JavaScript enabled, etc.)
   - Test with development environment for verbose logs

4. **Expo Setup**
   - Run `npx expo prebuild` after adding the SDK
   - Use SDK 49+ for compatibility
   - Follow platform-specific setup after prebuild

### Error 1001 Checklist
- Verify appId and requestId are provided
- Check phone number format (10 digits, no leading zero)
- Ensure all parameters are strings

### Error 1002 Troubleshooting
1. Check network connectivity
2. Verify SIM card status
3. Try toggling mobile data
4. Check service availability

### Script URL Loading Issues

1. **Metro Configuration Setup**
   - First, ensure you have the correct Metro bundler configuration:
   ```javascript
   // metro.config.js
   const { getDefaultConfig } = require('expo/metro-config');

   const config = getDefaultConfig(__dirname);

   // Add any custom configuration here if needed
   // For example, to add additional asset extensions:
   // config.resolver.assetExts.push('pem', 'key');

   module.exports = config;
   ```
   - This configuration uses Expo's default settings which handle most common cases
   - If you're not using Expo, use this basic Metro config:
   ```javascript
   // metro.config.js
   const { getDefaultConfig } = require('@react-native/metro-config');

   module.exports = (async () => {
     const config = await getDefaultConfig(__dirname);
     
     // Add custom configurations here if needed
     return config;
   })();
   ```

2. **Android: "Could not get script URL" Error**
   - **Problem**: After building the production APK, the app fails to load with "Could not get script URL" error
   - **Solution**:
     ```bash
     # Ensure the bundle exists in the correct location
     mkdir -p android/app/src/main/assets
     npx react-native bundle --platform android \
       --dev false \
       --entry-file index.ts \
       --bundle-output android/app/src/main/assets/index.android.bundle \
       --assets-dest android/app/src/main/res
     ```
   - Verify the bundle path in `android/app/src/main/AndroidManifest.xml`
   - Clean and rebuild: `cd android && ./gradlew clean && cd ..`

3. **iOS: Bundle Loading Failed**
   - **Problem**: Production IPA fails to load JavaScript bundle
   - **Solution**:
     ```bash
     # Generate the iOS bundle
     npx react-native bundle --platform ios \
       --dev false \
       --entry-file index.ts \
       --bundle-output ios/main.jsbundle \
       --assets-dest ios
     ```
   - Ensure bundle is included in Xcode project:
     1. Add `main.jsbundle` to project navigator in Xcode
     2. Check "Copy Bundle Resources" in Build Phases
     3. Verify bundle path in Info.plist
   - Clean build folder in Xcode: Product > Clean Build Folder

3. **Common Fixes for Both Platforms**
   - Verify entry file path matches your project structure (index.js/index.ts)
   - Verify your metro.config.js is being picked up by checking the Metro logs at startup
   - Check for any custom configurations needed in metro.config.js for your assets and dependencies

---

Need help? Contact support@cookiejar.co

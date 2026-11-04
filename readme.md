# Finvu Auth SDK — React Native

**Package:** `@io.github.cookiejar-technologies/finvu-auth-sdk-rn`  
**Version:** `1.0.3` · **React Native:** 0.70+ · **iOS:** 15.1+ · **Android:** API 25+

Silent Network Authentication (SNA) and Device Binding SDK for React Native, with WebView bridge support for web-based authentication flows.

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

> **Note for older React Native projects (< 0.74):** The dots in the package scope (`@io.github.*`) can break CLI autodetection for iOS. If `pod install` fails to find `FinvuAuthSdkRn`, add it manually to your `Podfile`:
> ```ruby
> pod 'FinvuAuthSdkRn', :path => '../node_modules/@io.github.cookiejar-technologies/finvu-auth-sdk-rn/ios'
> ```
> Then run `pod install` again.

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


#### Info.plist — Face ID

Required if you use Device Binding (native or WebView). Without it, iOS never offers Face ID and the prompt falls back to the passcode.

```xml
<key>NSFaceIDUsageDescription</key>
<string>Face ID is used to confirm it's you before binding or verifying this device.</string>
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

Use this if your app handles the authentication flow entirely in React Native, without a WebView. The SDK offers two factors: **SNA** (Silent Network Authentication) and **Device Binding** (a hardware-backed key that proves "this user, on this device").

Every method returns a Promise with exactly what the native Android / iOS SDK returns. Check `status`: on failure the result is

```json
{"status":"FAILURE","errorCode":"DEVICE_BINDING_NOT_ENROLLED","errorMessage":"Device is not enrolled. Please enroll before signing a challenge."}
```

```typescript
import {
  FinvuAuthEnvironment,
  FinvuAuthSdkInstance,
} from '@io.github.cookiejar-technologies/finvu-auth-sdk-rn';

// Setup — call once on mount, before any other method
FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.PRODUCTION);  // or DEVELOPMENT

// Cleanup — call when done or the user exits
FinvuAuthSdkInstance.cleanupAll();
```

#### SNA

```typescript
// 1. Init — call with the requestId from your backend
const initResult = await FinvuAuthSdkInstance.initSNA({ requestId: 'REQUEST_ID' });
// {"status":"SUCCESS","mcc":"404","mnc":"90", ...}

// 2. Start SNA — call with the SNA URL returned by your backend
const snaResult = await FinvuAuthSdkInstance.startSNA('SNA_URL');
if (snaResult.status === 'SUCCESS') {
  const snaToken = snaResult.snaToken;  // send to your backend
}
```

`initAuth` / `startAuth` are also supported and call the native `initAuth` / `startAuth` (same behaviour as `initSNA` / `startSNA`).

The `requestId` passed to `initSNA` is attached to every SNA event the SDK logs.

#### Device Binding

Device binding creates a key pair in the Android Keystore / iOS Secure Enclave. The private key never leaves the device and can only be used after the user unlocks with biometrics or the device PIN/passcode. Your backend stores the public key and verifies signatures with it.

> **iOS:** add `NSFaceIDUsageDescription` to `Info.plist` — see [Info.plist — Face ID](#infoplist--face-id).

**Typical flow**

1. **Check** — `getDeviceBindingState` with the `keyId` you stored for this user.
2. **Enroll** (state `NOT_ENROLLED` / `INVALIDATED`, or a new device) — `enrollDeviceBinding`, then store the returned `keyId` + `publicKey` on your backend against the user.
3. **Verify** — your backend issues a challenge; call `signDeviceBindingChallenge` with every `keyId` it has for the user; your backend verifies the returned signature.

```typescript
import { FinvuDeviceBindingState } from '@io.github.cookiejar-technologies/finvu-auth-sdk-rn';

// 1. Check state — local, no prompt, no network. Omit keyId to only check device support.
const state = await FinvuAuthSdkInstance.getDeviceBindingState({ keyId: 'STORED_KEY_ID' });
if (state.status === 'SUCCESS' && state.state === FinvuDeviceBindingState.ENROLLED) {
  // ready to sign; other states: NOT_ENROLLED, INVALIDATED, UNSUPPORTED, NO_SCREEN_LOCK
}

// 2. Enroll — shows the device-lock prompt, then creates a new key
const enroll = await FinvuAuthSdkInstance.enrollDeviceBinding({
  requestId: 'REQUEST_ID',
  promptTitle: "Verify it's you",                    // optional
  promptSubtitle: 'Confirm to secure your account',  // optional
});
if (enroll.status === 'SUCCESS') {
  // store enroll.keyId and enroll.publicKey on your backend
}

// 3. Sign — shows the device-lock prompt, then signs the challenge
const sign = await FinvuAuthSdkInstance.signDeviceBindingChallenge({
  requestId: 'REQUEST_ID',
  allowedKeyIds: ['KEY_ID_1', 'KEY_ID_2'],  // every keyId your backend has for this user
  challenge: 'SERVER_CHALLENGE',
});
if (sign.status === 'SUCCESS') {
  // send sign.signature and sign.keyId to your backend
} else if (sign.errorCode === 'DEVICE_BINDING_NOT_ENROLLED') {
  // new device for this user — verify another way, then enroll
}
```

**Parameters**

| Method | Key | Required | Description |
|---|---|---|---|
| `getDeviceBindingState` | `keyId` | No | `keyId` from a previous enroll. Omit to only check whether the device supports device binding. |
| `enrollDeviceBinding` | `requestId` | Recommended | Your backend's request id; attached to the logged events. |
| | `promptTitle`, `promptSubtitle` | No | Text on the device-lock prompt. |
| | `attestationChallenge` | No | Server nonce. Android returns a Keystore attestation chain in `attestation`; iOS ignores it. |
| `signDeviceBindingChallenge` | `allowedKeyIds` | Yes | Array of every `keyId` your backend has for this user (a single string is also accepted). The SDK signs with whichever exists on this device. |
| | `challenge` | Yes | Server-issued challenge. Signed exactly as its UTF-8 bytes. |
| | `requestId` | Recommended | Your backend's request id; attached to the logged events. |
| | `promptTitle`, `promptSubtitle` | No | Text on the device-lock prompt. |

`entityId` may also be passed to `enrollDeviceBinding` / `signDeviceBindingChallenge` and is attached to the logged events.

**Success responses**

```json
// getDeviceBindingState — keyId only when state is ENROLLED or INVALIDATED
{"status":"SUCCESS","state":"ENROLLED","keyId":"6f1c2a9e-3b7d-4c1a-9e2f-8a5b3c7d1e90"}

// enrollDeviceBinding — attestation only on Android, when attestationChallenge was passed
{"status":"SUCCESS","keyId":"6f1c2a9e-...","publicKey":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...","algorithm":"ES256"}

// signDeviceBindingChallenge
{"status":"SUCCESS","keyId":"6f1c2a9e-...","signature":"MEUCIQD...","algorithm":"ES256"}
```

| State | Meaning | What to do |
|---|---|---|
| `ENROLLED` | Key exists and is usable | Sign |
| `NOT_ENROLLED` | No key for this `keyId` on this device (or no `keyId` passed) | Enroll |
| `INVALIDATED` | Key is no longer usable (biometrics changed) | Enroll again and replace the `keyId` on your backend |
| `UNSUPPORTED` | Device cannot do device binding | Use another factor |
| `NO_SCREEN_LOCK` | No PIN/passcode set | Ask the user to set a screen lock |

**Error codes** (`errorCode`)

| errorCode | Method | When | Suggested handling |
|---|---|---|---|
| `DEVICE_NOT_SECURE` | enroll | No screen lock on the device | Ask the user to set a screen lock |
| `DEVICE_BINDING_UNSUPPORTED` | enroll, sign | Device has no usable secure hardware/authenticator | Use another factor |
| `DEVICE_BINDING_NOT_ENROLLED` | sign | None of `allowedKeyIds` exist on this device, or the list is empty | Treat as a new device: verify the user another way, then enroll |
| `DEVICE_BINDING_KEY_INVALIDATED` | sign | Key invalidated (biometrics changed) and removed | Enroll again and replace the `keyId` |
| `DEVICE_BINDING_USER_CANCELLED` | enroll, sign | User dismissed the prompt | Let the user retry |
| `DEVICE_BINDING_AUTH_FAILED` | enroll, sign | Prompt failed (e.g. too many attempts) | Show the message; retry later |
| `DEVICE_BINDING_ENROLL_FAILED` | enroll | Key could not be created | Retry, then fall back |
| `DEVICE_BINDING_SIGN_FAILED` | sign | Signing failed | Retry, then fall back |
| `INVALID_CHALLENGE` | sign | `challenge` missing or empty | Fix the request |
| `SESSION_NOT_INITIALIZED` | all (Android) | `setup` was not called | Call `setup` first |

**Backend verification**

- Store `keyId` and `publicKey` per user **per device**; a user may have several.
- `publicKey` is a Base64 X.509 SubjectPublicKeyInfo (EC P-256). Verify `signature` (Base64, DER-encoded ECDSA) as **ES256 / SHA256withECDSA** over the UTF-8 bytes of the challenge you issued.
- After re-enrolling on the same device, replace that device's old `keyId`; on a new device, add the new one.
- Uninstalling the app removes the key on Android, but not on iOS (the Keychain keeps it). Require a fresh enroll on your backend if a reinstall should unbind the device.

#### Capabilities

```typescript
const capabilities = await FinvuAuthSdkInstance.getCapabilities();
// {"status":"SUCCESS","sdkVersion":"...","platform":"android" | "ios","bridgeVersion":2,"factors":["SNA","DEVICE_BINDING"],"supportedMethods":[...]}
```

---

## Demo App

See [`BareDemoApp/`](./BareDemoApp) for a complete bare React Native working example.


## Support

support@cookiejar.co.in · [finvu.in](https://finvu.in)

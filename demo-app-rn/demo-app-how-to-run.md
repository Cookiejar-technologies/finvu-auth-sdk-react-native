# How to Run the Finvu Auth SDK Demo App

This guide provides step-by-step instructions for setting up and running the Finvu Auth SDK demo application.

## Prerequisites

- [Git](https://git-scm.com/downloads) installed
- [Node.js](https://nodejs.org/) v16 or higher
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (if not installed, run `npm install -g expo-cli`)
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835) for iOS development (Mac only)
- [Android Studio](https://developer.android.com/studio) for Android development

## Getting Started

1. **Clone the Repository**
   ```bash
   # Clone the repository
   git clone https://github.com/cookiejar-technologies/finvu-auth-sdk-react-native.git
   
   # Navigate to the demo app directory
   cd finvu-auth-sdk-react-native/demo-app-rn
   ```

2. **Setup GitHub Package Registry**
   
   The SDK is hosted on GitHub Packages. You need to authenticate to download it:

   a. Create a GitHub Personal Access Token (PAT):
   - Go to GitHub Settings > Developer Settings > Personal Access Tokens
   - Generate new token (classic)
   - Select `read:packages` scope
   - Copy the generated token

   b. Create or edit `~/.npmrc` file:
   ```
   @cookiejar-technologies:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
   ```

   c. Login to GitHub Packages:
   ```bash
   npm login --registry=https://npm.pkg.github.com --scope=@cookiejar-technologies
   ```

3. **Install Dependencies**
   ```bash
   # Install npm packages
   npm install
   
   # If you encounter package loading issues:
   npm cache clean --force
   npm install --legacy-peer-deps
   ```

## Common Setup Issues and Solutions

### Package Loading Issues

1. **"Unable to resolve package" Error**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and package-lock.json
   rm -rf node_modules package-lock.json
   
   # Reinstall packages
   npm install
   ```

2. **GitHub Package Registry Authentication Issues**
   - Verify your PAT has `read:packages` scope
   - Check `.npmrc` file configuration
   - Try logging in again:
   ```bash
   npm logout --registry=https://npm.pkg.github.com --scope=@cookiejar-technologies
   npm login --registry=https://npm.pkg.github.com --scope=@cookiejar-technologies
   ```

## Platform-Specific Setup

### iOS Setup
```bash
# Install CocoaPods dependencies
cd ios
pod install
cd ..

# If you encounter CocoaPods issues:
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update
cd ..
```

### Android Setup
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

## Running the App

1. **Start Metro Bundler**
   ```bash
   # Start the development server
   npm start
   ```

2. **Run on iOS (Mac only)**
   ```bash
   npm run ios
   ```

3. **Run on Android**
   ```bash
   npm run android
   ```

## Troubleshooting

### Script URL Loading Issues

1. **Verify Metro Configuration**
   - Check `metro.config.js` is properly configured:
   ```javascript
   const { getDefaultConfig } = require('expo/metro-config');
   
   const config = getDefaultConfig(__dirname);
   
   module.exports = config;
   ```

2. **Bundle Generation Issues**
   ```bash
   # For Android
   mkdir -p android/app/src/main/assets
   npx react-native bundle --platform android \
     --dev false \
     --entry-file index.ts \
     --bundle-output android/app/src/main/assets/index.android.bundle \
     --assets-dest android/app/src/main/res
   
   # For iOS
   npx react-native bundle --platform ios \
     --dev false \
     --entry-file index.ts \
     --bundle-output ios/main.jsbundle \
     --assets-dest ios
   ```

### Environment Setup

- During development:
  ```typescript
  FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.DEVELOPMENT);
  ```

- For production builds:
  ```typescript
  FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.PRODUCTION);
  ```

## Need Help?

If you encounter any issues:
1. Check the [Main SDK Documentation](../README.md)
2. Review the [Troubleshooting Guide](../README.md#troubleshooting)
3. Contact support at support@cookiejar.co

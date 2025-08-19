// App.tsx
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import NativeViewScreen from './src/screens/NativeViewScreen';
import WebViewScreen from './src/screens/WebViewScreen';



export type RootStackParamList = {
  Home: undefined;
  NativeView: undefined;
  WebView: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Finvu Demo' }} />
        <Stack.Screen name="NativeView" component={NativeViewScreen} options={{ title: 'Native View' }} />
        <Stack.Screen name="WebView" component={WebViewScreen} options={{ title: 'WebView' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

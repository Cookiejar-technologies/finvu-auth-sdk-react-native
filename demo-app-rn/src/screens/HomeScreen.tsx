// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { styles } from '../styles/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.spacer} />
            <Button
                title="Load Native View"
                onPress={() => navigation.navigate('NativeView')}
            />
            <View style={styles.gap} />
            <Button
                title="Load WebView"
                onPress={() => navigation.navigate('WebView')}
            />
            <View style={styles.spacer} />
        </View>
    );
}

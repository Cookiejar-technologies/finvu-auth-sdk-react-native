// src/screens/NativeViewScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, ActivityIndicator } from 'react-native';
import { inputProps, inputStyles, styles } from '../styles/styles';
import { FinvuAuthEnvironment, FinvuAuthSdkInstance } from '@cookiejar-technologies/finvu-auth-sdk-rn';

export default function NativeViewScreen() {
    const [requestId, setRequestId] = useState('');
    const [appId, setAppId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [initDone, setInitDone] = useState(false);
    const [busy, setBusy] = useState<'init' | 'start' | null>(null);
    const [response, setResponse] = useState<any>(null);

    // setup environment once
    useEffect(() => {
        FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.DEVELOPMENT);
        return () => {
            // optional cleanup when leaving screen
            try { FinvuAuthSdkInstance.cleanupAll(); } catch { }
        };
    }, []);

    const canStart = useMemo(() => initDone && phoneNumber.trim().length > 0, [initDone, phoneNumber]);

    const handleInitAuth = async () => {
        setBusy('init');
        setResponse(null);

        try {
            // shape the init config as your native layer expects
            const initConfig = {
                requestId: requestId.trim(),
                appId: appId.trim(),
                // include anything else you need here (env, options, etc.)
            };

            const res = await FinvuAuthSdkInstance.initAuth(initConfig);
            setResponse(res);

            // if success marker differs in your SDK, adjust this check:
            const isSuccess = (res as any)?.status === 'SUCCESS' || (res as any)?.success === true || (res as any)?.code === 'OK';
            if (isSuccess) {
                setInitDone(true); // lock req/app ids, unlock phone/start
            }
        } catch (e) {
            setResponse(e);
            setInitDone(false);
        } finally {
            setBusy(null);
        }
    };

    const handleStartAuth = async () => {
        if (!canStart) return;
        setBusy('start');
        try {
            const res = await FinvuAuthSdkInstance.startAuth(phoneNumber.trim());
            setResponse(res);
        } catch (e) {
            setResponse(e);
        } finally {
            setBusy(null);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.containerPadded}>

            <View style={styles.gap} />

            <Button title={busy === 'init' ? 'Initializing...' : 'Init Auth'} onPress={handleInitAuth} disabled={busy !== null} />

            <View style={styles.divider} />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
                {...inputProps}
                style={[inputStyles.input, (!initDone) && inputStyles.disabled]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                editable={initDone}
            />

            <View style={styles.gap} />

            <Button title={busy === 'start' ? 'Starting...' : 'Start Auth'} onPress={handleStartAuth} disabled={!canStart || busy !== null} />

            <View style={styles.divider} />

            <Text style={styles.label}>SDK Response</Text>
            {busy ? (
                <ActivityIndicator />
            ) : (
                <View style={styles.responseBox}>
                    <Text style={styles.codeText}>
                        {response ? JSON.stringify(response, null, 2) : 'No response yet.'}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

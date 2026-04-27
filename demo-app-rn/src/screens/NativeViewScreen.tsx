// src/screens/NativeViewScreen.tsx — Finvu Auth RN SDK 2.x (initAuth: requestId only; startAuth: snaLink)
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, ActivityIndicator } from 'react-native';
import { inputProps, inputStyles, styles } from '../styles/styles';
import { FinvuAuthEnvironment, FinvuAuthSdkInstance } from '@cookiejar-technologies/finvu-auth-sdk-rn';

const DEFAULT_REQUEST_ID = 'r233432';

export default function NativeViewScreen() {
    const [requestId, setRequestId] = useState(DEFAULT_REQUEST_ID);
    const [snaLink, setSnaLink] = useState('');

    const [initDone, setInitDone] = useState(false);
    const [busy, setBusy] = useState<'init' | 'start' | null>(null);
    const [response, setResponse] = useState<any>(null);

    useEffect(() => {
        FinvuAuthSdkInstance.setup(FinvuAuthEnvironment.DEVELOPMENT);
        return () => {
            try { FinvuAuthSdkInstance.cleanupAll(); } catch { }
        };
    }, []);

    const canStart = useMemo(() => initDone && snaLink.trim().length > 0, [initDone, snaLink]);

    const handleInitAuth = async () => {
        setBusy('init');
        setResponse(null);

        try {
            const initConfig = {
                requestId: requestId.trim(),
            };

            const res = await FinvuAuthSdkInstance.initAuth(initConfig);
            setResponse(res);

            const isSuccess = (res as any)?.status === 'SUCCESS' || (res as any)?.success === true || (res as any)?.code === 'OK';
            if (isSuccess) {
                setInitDone(true);
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
            const res = await FinvuAuthSdkInstance.startAuth(snaLink.trim());
            setResponse(res);
        } catch (e) {
            setResponse(e);
        } finally {
            setBusy(null);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.containerPadded}>

            <Text style={styles.label}>Request ID</Text>
            <TextInput
                {...inputProps}
                style={[inputStyles.input, initDone && inputStyles.disabled]}
                value={requestId}
                onChangeText={setRequestId}
                placeholder="Request ID"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!initDone}
            />

            <View style={styles.gap} />

            <Button title={busy === 'init' ? 'Initializing...' : 'Init Auth'} onPress={handleInitAuth} disabled={busy !== null} />

            <View style={styles.divider} />

            <Text style={styles.label}>SNA Link</Text>
            <TextInput
                {...inputProps}
                style={[inputStyles.input, (!initDone) && inputStyles.disabled]}
                value={snaLink}
                onChangeText={setSnaLink}
                placeholder="snaUrl?reqId=sdfsddf"
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
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

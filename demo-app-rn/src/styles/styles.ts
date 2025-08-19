// src/styles.ts
import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    containerPadded: { padding: 16 },
    gap: { height: 16 },
    spacer: { flex: 1 },
    label: { fontWeight: '600', marginBottom: 6, marginTop: 12 },
    divider: { height: 24 },
    responseBox: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fafafa',
    },
    codeText: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 12 },
});

// src/styles.ts
export const inputProps = {
  placeholderTextColor: 'black' as const,
};


export const inputStyles = StyleSheet.create({
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 10,
    },
    disabled: {
        backgroundColor: '#f1f1f1',
        color: '#888',
    },
});

/**
 * Bare React Native demo for @io.github.cookiejar-technologies/finvu-auth-sdk-rn.
 *
 * Layout:
 *   - HomeScreen with title, WebView URL input, and two buttons.
 *   - WebViewScreen with a persistent header, the WebView, and a floating
 *     "JS Logs" button that opens a modal showing captured console output.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import {
  FinvuAuthEnvironment,
  FinvuAuthenticationWebviewWrapper,
} from '@io.github.cookiejar-technologies/finvu-auth-sdk-rn';

const DEFAULT_URL = 'https://test-web-app-8a50c.web.app';
const HEADER_TITLE = 'Finvu Auth SDK Demo App';
const CONSOLE_PREFIX = '__finvu_console__:';

const consoleHookScript = `
(function() {
  if (window.__finvuConsoleHook) return;
  window.__finvuConsoleHook = true;
  var levels = ['log', 'info', 'warn', 'error', 'debug'];
  levels.forEach(function(level) {
    var original = console[level];
    console[level] = function() {
      try {
        var args = Array.prototype.slice.call(arguments);
        var formatted = args.map(function(a) {
          if (a instanceof Error) return a.stack || a.message;
          if (typeof a === 'object') {
            try { return JSON.stringify(a); } catch (e) { return String(a); }
          }
          return String(a);
        }).join(' ');
        window.ReactNativeWebView.postMessage('${CONSOLE_PREFIX}[' + level.toUpperCase() + '] ' + formatted);
      } catch (e) {}
      return original.apply(console, arguments);
    };
  });
  window.addEventListener('error', function(e) {
    try {
      window.ReactNativeWebView.postMessage('${CONSOLE_PREFIX}[ERROR] ' + (e.message || 'Unknown error'));
    } catch (err) {}
  });
})();
true;
`;

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{HEADER_TITLE}</Text>
    </View>
  );
}

function HomeScreen({ onLoadWebView }: { onLoadWebView: (url: string) => void }) {
  const [url, setUrl] = useState(DEFAULT_URL);

  return (
    <View style={styles.body}>
      <View style={styles.spacerSm} />
      <Text style={styles.label}>WebView URL</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="Enter WebView URL"
        placeholderTextColor="#999"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.gap} />
      <Button title="Load WebView" onPress={() => onLoadWebView(url.trim())} />
      <View style={styles.gap} />
      <Button
        title="Load Native View"
        color="#2e7d32"
        onPress={() =>
          /* native flow placeholder — out of scope for this demo */
          undefined
        }
      />
    </View>
  );
}

function WebViewScreen({
  url,
  onBack,
}: {
  url: string;
  onBack: () => void;
}) {
  const webViewRef = useRef<WebView>(null);
  const wrapperRef = useRef<FinvuAuthenticationWebviewWrapper | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    wrapperRef.current = new FinvuAuthenticationWebviewWrapper(
      FinvuAuthEnvironment.DEVELOPMENT,
    );
    return () => {
      try {
        wrapperRef.current?.cleanupAll();
      } catch {}
    };
  }, []);

  const handleMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    if (typeof data === 'string' && data.startsWith(CONSOLE_PREFIX)) {
      const log = data.slice(CONSOLE_PREFIX.length);
      setLogs(prev => [...prev, log]);
      return;
    }
    wrapperRef.current?.handleMessage(event, webViewRef);
  };

  return (
    <View style={styles.body}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          onMessage={handleMessage}
          javaScriptEnabled
          startInLoadingState
          injectedJavaScriptBeforeContentLoaded={consoleHookScript}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowLogs(true)}
          activeOpacity={0.8}>
          <Text style={styles.fabText}>JS Logs ({logs.length})</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={false}
        visible={showLogs}
        onRequestClose={() => setShowLogs(false)}>
        <SafeAreaView style={styles.logsModal}>
          <View style={styles.logsHeader}>
            <Text style={styles.logsTitle}>JS Console ({logs.length})</Text>
            <View style={styles.logsActions}>
              <TouchableOpacity onPress={() => setLogs([])}>
                <Text style={styles.logsButton}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowLogs(false)}>
                <Text style={styles.logsButton}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
          {logs.length === 0 ? (
            <View style={styles.logsEmpty}>
              <Text style={styles.logsEmptyText}>No logs yet.</Text>
            </View>
          ) : (
            <FlatList
              data={logs}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.logsList}
              renderItem={({ item }) => (
                <Text selectable style={styles.logLine}>
                  {item}
                </Text>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

export default function App() {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const content = useMemo(() => {
    if (activeUrl) {
      return (
        <WebViewScreen url={activeUrl} onBack={() => setActiveUrl(null)} />
      );
    }
    return <HomeScreen onLoadWebView={setActiveUrl} />;
  }, [activeUrl]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  body: { flex: 1, padding: 16 },
  label: { fontWeight: 'bold', color: '#000', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#000',
  },
  gap: { height: 12 },
  spacerSm: { height: 8 },
  backRow: { paddingBottom: 8 },
  backButton: { paddingVertical: 6, paddingHorizontal: 4 },
  backText: { color: '#1976d2', fontSize: 16 },
  webviewContainer: { flex: 1, position: 'relative' },
  fab: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fabText: { color: '#fff', fontFamily: 'monospace', fontSize: 12 },
  logsModal: { flex: 1, backgroundColor: '#1e1e1e' },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  logsTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logsActions: { flexDirection: 'row', gap: 16 },
  logsButton: { color: '#fff', fontSize: 14 },
  logsList: { padding: 16 },
  logLine: {
    color: '#00ff66',
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 6,
  },
  logsEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logsEmptyText: { color: '#999' },
});

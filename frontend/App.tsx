import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export default function App() {
  const [status, setStatus] = useState('Ready to check your environment.');
  const [loading, setLoading] = useState(false);

  async function checkConnection() {
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const api = await fetch(`${apiUrl}/api/health`, { signal: controller.signal });
      if (!api.ok) throw new Error('API health check failed.');
      const db = await fetch(`${apiUrl}/api/health/db`, { signal: controller.signal });
      setStatus(db.ok ? 'API and MySQL are connected.' : 'API is running. MySQL is unavailable; check the database and backend .env.');
    } catch {
      setStatus('Cannot reach the API. Check the backend, API URL, Wi-Fi, and firewall.');
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Manager</Text>
      <Text>React Native + Expo + Express + MySQL</Text>
      <Text style={styles.details}>API: {apiUrl}</Text>
      <Text accessibilityLiveRegion="polite" style={styles.details}>{status}</Text>
      <Button title={loading ? 'Checking...' : 'Check connection'} disabled={loading} onPress={checkConnection} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: { fontSize: 28, fontWeight: '700' },
  details: { textAlign: 'center', color: '#374151' },
});

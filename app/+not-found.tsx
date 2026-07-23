import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../src/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🗺️</Text>
        <Text style={styles.title}>Lost in the Park!</Text>
        <Text style={styles.sub}>This path doesn't exist yet.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: COLORS.bg.primary, padding: 24 },
  emoji:     { fontSize: 48 },
  title:     { fontFamily: FONTS.display, fontSize: 24, color: COLORS.text.primary },
  sub:       { fontFamily: FONTS.body, fontSize: 15, color: COLORS.text.muted },
  link:      { marginTop: 8 },
  linkText:  { fontFamily: FONTS.heading, fontSize: 15, color: COLORS.brand.primary },
});

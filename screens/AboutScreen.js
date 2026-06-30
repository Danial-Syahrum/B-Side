import React from 'react';
import { StyleSheet, Text, View, ScrollView, Linking, TouchableOpacity} from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.outerContainer} contentContainerStyle={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>B-Side</Text>
        <Text style={styles.versionBadge}>v1.0.1</Text>
        <TouchableOpacity 
          onPress={() => Linking.openURL('https://github.com/Danial-Syahrum/B-Side')}
          activeOpacity={0.7}
        >
          <Text style={styles.githubLink}>/Danial-Syahrum/B-Side</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>📱 System Usage</Text>
        <Text style={styles.sectionBody}>
          A real-time mobile tracking platform built to help music enthusiasts catalog their album review records, filter tracklists by score metrics, and browse global community discoveries smoothly.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>💼 Entrepreneurial Value</Text>
        <Text style={styles.sectionBody}>
          By allowing users to document physical acquisition locations (Local Shops, Bandcamp, Merch Tables), B-Side captures localized marketplace trends that can be utilized to drive targeted ad loops and strategic indie retail partnerships.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>🌐 Data Attribution</Text>
        <Text style={styles.sectionBody}>
          Live global catalog, data searches, and dynamic album artwork assets are powered by the <Text style={styles.highlightText}>Last.fm API</Text>.
        </Text>
      </View>

      <View style={styles.divider} />
      <View style={styles.devBlock}>
        <Text style={styles.devLabel}>Developed By</Text>
        <Text style={styles.devName}>Danial Syahrum</Text>
      </View>

      <Text style={styles.footerText}>© 2026 B-Side by Danial Syahrum.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#121212' },
  container: { padding: 24, paddingBottom: 40 },
  headerBlock: { alignItems: 'center', width: '100%', marginTop: 10 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  versionBadge: { fontSize: 13, color: '#1DB954', fontWeight: '700', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#222', width: '100%', marginVertical: 20 },
  section: { width: '100%', marginBottom: 20 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  sectionBody: { fontSize: 13, color: '#aaa', lineHeight: 20 },
  highlightText: { color: '#1DB954', fontWeight: '600' },
  devBlock: { width: '100%', alignItems: 'center', marginVertical: 10 },
  devLabel: { fontSize: 12, color: '#666', textTransform: 'uppercase', fontWeight: '700', letterSpacing: 1 },
  devName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  footerText: { color: '#444', fontSize: 11, fontWeight: '600', marginTop: 30, textAlign: 'center', width: '100%' },
  githubLink: { fontSize: 13, color: '#888', textDecorationLine: 'underline', marginTop: 6, fontWeight: '500' },
});
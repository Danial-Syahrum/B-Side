import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Image, ActivityIndicator } from 'react-native';

const LASTFM_API_KEY = process.env.EXPO_PUBLIC_LASTFM_API_KEY; 

export default function SearchScreen({ navigation }) {
  const [queryText, setQueryText] = useState('');
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const searchAlbums = async () => {
    if (!queryText.trim()) return;

    setLoading(true);
    setErrorMsg('');
    
    // Construct the endpoint URL mapping to Last.fm's JSON specification
    const url = `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(queryText)}&api_key=${LASTFM_API_KEY}&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Navigate down the JSON tree structure returned by Last.fm
      if (data.results && data.results.albummatches) {
        const matches = data.results.albummatches.album;
        
        // Map the data into a cleaner structure for our interface state
        const formattedAlbums = matches.map((album) => ({
          id: `${album.name}-${album.artist}`, // unique string fallback identifier
          name: album.name,
          artist: album.artist,
          image: album.image[2]['#text'] || 'https://via.placeholder.com/150' // grab medium size artwork
        }));

        setAlbums(formattedAlbums);
      } else {
        setErrorMsg("No matching records found.");
      }
    } catch (err) {
      setErrorMsg("Failed to query Last.fm. Check your network or API Key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Music</Text>
      
      {/* Search Bar Input Layout Wrapper */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search for an album..."
          placeholderTextColor="#666"
          value={queryText}
          onChangeText={setQueryText}
          onSubmitEditing={searchAlbums} // allows pressing 'enter' on keyboard to execute
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchAlbums}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Status Feedback Indicators */}
      {loading && <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 20 }} />}
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      {/* Album List Results Tree */}
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.albumItem}
            onPress={() => {
              // Pressing an album takes the user to AddReviewScreen, passing along the metadata!
              navigation.navigate('AddReviewScreen', { selectedAlbum: item });
            }}
          >
            <Image source={{ uri: item.image }} style={styles.coverArt} />
            <View style={styles.albumDetails}>
              <Text style={styles.albumTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.albumArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <Text style={styles.arrowIcon}>➔</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 15, marginTop: 10 },
  searchRow: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, fontSize: 16, marginRight: 10 },
  searchButton: { backgroundColor: '#1DB954', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#ff4444', textAlign: 'center', marginVertical: 10, fontWeight: '600' },
  albumItem: { flexDirection: 'row', backgroundColor: '#1e1e1e', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  coverArt: { width: 50, height: 50, borderRadius: 4, marginRight: 15, backgroundColor: '#333' },
  albumDetails: { flex: 1 },
  albumTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  albumArtist: { color: '#888', fontSize: 14, marginTop: 2 },
  arrowIcon: { color: '#1DB954', fontSize: 18, paddingHorizontal: 5 }
});
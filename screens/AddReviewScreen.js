// screens/AddReviewScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native';
// Added getDocs, query, and where to prevent duplicate records
import { collection, doc, addDoc, updateDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AddReviewScreen({ route, navigation, userSession }) {
  // 1. Check if we passed a review to modify from the HomeScreen selection
  const reviewToEdit = route?.params?.reviewToEdit;
  const isEditing = !!reviewToEdit;

  // 2. Fallback cleanly to your standard selectedAlbum structure or parameters if editing
  const selectedAlbum = isEditing
    ? { name: reviewToEdit.albumName, artist: reviewToEdit.artist, image: reviewToEdit.coverArtUrl }
    : (route?.params?.selectedAlbum || {
      name: "Test Album",
      artist: "Test Artist",
      image: "https://via.placeholder.com/150"
    });

  // 3. Initialize your states conditionally depending on whether you are editing or logging fresh
  const [rating, setRating] = useState(isEditing ? reviewToEdit.userRating : 0);
  const [notes, setNotes] = useState(isEditing ? reviewToEdit.userNotes : '');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
  const [source, setSource] = useState(isEditing ? (reviewToEdit.source || 'Digital') : 'Digital');
  
  const sourceOptions = ['Local Shop', 'Bandcamp', 'Merch Table', 'Digital'];

  // Array used to map our 5 custom radio options
  const starOptions = [1, 2, 3, 4, 5];

  const saveReview = async () => {
    setStatusMessage({ text: '', isError: false });

    if (!rating || !notes.trim()) {
      setStatusMessage({ text: "Please provide a star rating and review notes.", isError: true });
      return;
    }

    setLoading(true);
    try {
      const currentUserId = userSession?.docId || "anonymous_user";
      const currentUsername = userSession?.username || "music_fan";

      if (isEditing) {
        // --- MODE A: DIRECT EDITING FROM HOMESCREEN ---
        const docRef = doc(db, "reviews", reviewToEdit.id);
        await updateDoc(docRef, {
          username: currentUsername, // Update username if it changed or wasn't there
          userRating: Number(rating),
          userNotes: notes.trim(),
          source: source,            // Save chosen acquisition context
          updatedAt: serverTimestamp()
        });

        setStatusMessage({ text: "Modifications saved to your B-Side tracklist!", isError: false });
      } else {
        // --- MODE B: FRESH LOG / SEARCH TRACKING (PREVENTING DUPLICATES) ---

        // Query to check if this user has already logged this specific album
        const reviewsRef = collection(db, "reviews");
        const duplicateQuery = query(
          reviewsRef,
          where("userId", "==", currentUserId),
          where("albumName", "==", selectedAlbum.name),
          where("artist", "==", selectedAlbum.artist)
        );

        const querySnapshot = await getDocs(duplicateQuery);

        if (!querySnapshot.empty) {
          // Match found! Overwrite the existing review instead of appending a duplicate
          const existingDocId = querySnapshot.docs[0].id;
          const docRef = doc(db, "reviews", existingDocId);

          await updateDoc(docRef, {
            username: currentUsername, // Keep username valid on global timeline overwrite
            userRating: Number(rating),
            userNotes: notes.trim(),
            source: source,            // Update acquisition context on duplicate overwrite
            updatedAt: serverTimestamp()
          });

          setStatusMessage({ text: "Existing log updated with your new thoughts!", isError: false });
        } else {
          // No match found. Safe to generate a brand new record
          await addDoc(collection(db, "reviews"), {
            userId: currentUserId,
            username: currentUsername, // Tied username to document properties for global feed tracking
            albumName: selectedAlbum.name,
            artist: selectedAlbum.artist,
            coverArtUrl: selectedAlbum.image,
            userRating: Number(rating),
            userNotes: notes.trim(),
            source: source,            // Save acquisition context for fresh logs
            createdAt: serverTimestamp()
          });

          setStatusMessage({ text: "Review logged to your B-Side tracklist!", isError: false });
        }
      }

      setTimeout(() => {
        navigation.navigate("Home");
      }, 1500);

    } catch (error) {
      setStatusMessage({ text: `Failed to save review: ${error.message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Album Cover Image Render on top of the headers */}
      {selectedAlbum.image ? (
        <Image source={{ uri: selectedAlbum.image }} style={styles.topCoverArt} />
      ) : (
        <View style={[styles.topCoverArt, styles.placeholderArt]} />
      )}

      <Text style={styles.title}>{selectedAlbum.name}</Text>
      <Text style={styles.subtitle}>{selectedAlbum.artist}</Text>

      {/* Custom Component Radio Selection Bar */}
      <Text style={styles.radioLabel}>Your Score:</Text>
      <View style={styles.radioContainer}>
        {starOptions.map((num) => {
          const isSelected = num <= rating; // Highlights up to the active selection rank
          return (
            <TouchableOpacity
              key={num}
              activeOpacity={0.7}
              onPress={() => setRating(num)}
              style={styles.starWrapper}
            >
              <Text style={[styles.starText, isSelected ? styles.starSelected : styles.starUnselected]}>
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Entrepreneurial Niche Feature: Acquisition Source Selector */}
      <Text style={styles.radioLabel}>Where did you dig this up?</Text>
      <View style={styles.sourceContainer}>
        {sourceOptions.map((opt) => {
          const isSelected = source === opt;
          return (
            <TouchableOpacity
              key={opt}
              activeOpacity={0.7}
              style={[styles.sourceChip, isSelected && styles.activeSourceChip]}
              onPress={() => setSource(opt)}
            >
              <Text style={[styles.sourceText, isSelected && styles.activeSourceText]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your track-by-track breakdown or general notes..."
        multiline
        value={notes}
        onChangeText={setNotes}
        placeholderTextColor="#666"
      />

      {statusMessage.text ? (
        <Text style={[styles.statusText, statusMessage.isError ? styles.errorText : styles.successText]}>
          {statusMessage.text}
        </Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={saveReview} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isEditing ? "Save Modifications" : "Save Review"}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#121212', alignItems: 'center' },
  topCoverArt: { width: 140, height: 140, borderRadius: 12, marginBottom: 20, backgroundColor: '#333', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  placeholderArt: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', width: '100%' },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 20, width: '100%' },
  radioLabel: { color: '#aaa', fontSize: 14, alignSelf: 'flex-start', marginBottom: 8, fontWeight: '600' },
  radioContainer: { flexDirection: 'row', justifyContent: 'center', width: '100%', marginBottom: 20, gap: 10 },
  starWrapper: { padding: 5 },
  starText: { fontSize: 36 },
  starSelected: { color: '#FFD700' },
  starUnselected: { color: '#333' },

  // Acquisition Source Selector Elements Styles
  sourceContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%', marginBottom: 25 },
  sourceChip: { backgroundColor: '#1e1e1e', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  activeSourceChip: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  sourceText: { color: '#888', fontSize: 13, fontWeight: '600' },
  activeSourceText: { color: '#fff', fontWeight: '700' },

  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, width: '100%', fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  statusText: { textAlign: 'center', fontSize: 14, fontWeight: '600', marginBottom: 15 },
  successText: { color: '#1DB954' },
  errorText: { color: '#ff4444' },
  button: { backgroundColor: '#1DB954', padding: 15, borderRadius: 8, alignItems: 'center', height: 50, justifyContent: 'center', width: '100%' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
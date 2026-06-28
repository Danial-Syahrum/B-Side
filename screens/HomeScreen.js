// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, ActivityIndicator, ScrollView } from 'react-native';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Destructured 'navigation' out of the incoming screen props
export default function HomeScreen({ userSession, setUserSession, navigation }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State to handle star filter selection (null means "All")
  const [selectedStarFilter, setSelectedStarFilter] = useState(null);

  useEffect(() => {
    const targetUserId = userSession?.docId || userSession?.uid;
    
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("userId", "==", targetUserId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = [];
      snapshot.forEach((doc) => {
        fetchedReviews.push({ id: doc.id, ...doc.data() });
      });

      // Sort client-side: Newest first
      fetchedReviews.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setReviews(fetchedReviews);
      setLoading(false);
    }, (error) => {
      console.error("Firestore listening error: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userSession]);

  const handleDeleteReview = async (reviewId, albumName) => {
    const confirmed = window.confirm(`Are you sure you want to remove your review for "${albumName}"?`);
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "reviews", reviewId));
    } catch (error) {
      alert(`Failed to delete record: ${error.message}`);
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // Filter the reviews locally based on selected star count
  const filteredReviews = selectedStarFilter 
    ? reviews.filter(item => Number(item.userRating) === selectedStarFilter)
    : reviews;

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.welcomeText}>Hey, {userSession?.fullName || "Music Lover"}</Text>
          <Text style={styles.usernameText}>@{userSession?.username || "bside_user"}</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={() => setUserSession(null)}>
          <Text style={styles.signOutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your Tracklist Log ({reviews.length})</Text>

      {/* Horizontal Filter Bar Component Container */}
      <View style={styles.filterOuterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterBarContainer}
        >
          <TouchableOpacity 
            style={[styles.filterChip, selectedStarFilter === null && styles.activeFilterChip]}
            activeOpacity={0.7}
            onPress={() => setSelectedStarFilter(null)}
          >
            <Text style={[styles.filterChipText, selectedStarFilter === null && styles.activeFilterChipText]}>
              All Logs
            </Text>
          </TouchableOpacity>

          {[5, 4, 3, 2, 1].map((starNum) => {
            const isActive = selectedStarFilter === starNum;
            return (
              <TouchableOpacity 
                key={starNum}
                style={[styles.filterChip, isActive && styles.activeFilterChip]}
                activeOpacity={0.7}
                onPress={() => setSelectedStarFilter(starNum)}
              >
                <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>
                  {starNum} ★
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={{ flex: 1 }} />
      ) : filteredReviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedStarFilter ? `No ${selectedStarFilter}-star reviews found.` : "Your tracklist is empty."}
          </Text>
          <Text style={styles.emptySubText}>
            {selectedStarFilter 
              ? "Try adjusting your score filters above to find other logs!" 
              : "Head over to the Find Music tab to log your first review record!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            /* Transformed the static card container into an active button link */
            <TouchableOpacity 
              style={styles.reviewCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AddReviewScreen', { reviewToEdit: item })}
            >
              <Image source={{ uri: item.coverArtUrl }} style={styles.cardCover} />
              <View style={styles.cardContent}>
                <Text style={styles.albumName} numberOfLines={1}>{item.albumName}</Text>
                <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
                <Text style={styles.starRating}>{renderStars(item.userRating)}</Text>
                
                {/* Entrepreneurial Context Indicator Badge */}
                {item.source && (
                  <Text style={styles.sourceTag}>
                    📍 Source: {item.source}
                  </Text>
                )}
                
                {/* Removed numberOfLines here so the complete text expands dynamically */}
                <Text style={styles.userNotes}>{item.userNotes}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeleteReview(item.id, item.albumName)}
                activeOpacity={0.6}
              >
                <Text style={styles.deleteIconText}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 15 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  usernameText: { fontSize: 14, color: '#888' },
  signOutButton: { backgroundColor: '#222', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#444' },
  signOutText: { color: '#ff4444', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  
  // Dynamic Chip Filtering Component Bar Layout Styles
  filterOuterWrapper: { marginBottom: 20, width: '100%' },
  filterBarContainer: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  filterChip: { backgroundColor: '#222', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  activeFilterChip: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  filterChipText: { color: '#aaa', fontSize: 13, fontWeight: '600' },
  activeFilterChipText: { color: '#fff', fontWeight: '700' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { color: '#aaa', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  emptySubText: { color: '#666', fontSize: 14, textAlign: 'center' },
  list: { flex: 1 },
  // Changed alignItems from 'center' to 'flex-start' so the image stays nicely pinned to the top as reviews grow longer
  reviewCard: { flexDirection: 'row', backgroundColor: '#1e1e1e', borderRadius: 8, padding: 12, marginBottom: 12, alignItems: 'flex-start', position: 'relative' },
  cardCover: { width: 70, height: 70, borderRadius: 6, marginRight: 15, backgroundColor: '#333' },
  cardContent: { flex: 1, paddingRight: 10 },
  albumName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  artistName: { color: '#aaa', fontSize: 14, marginBottom: 2 },
  starRating: { color: '#FFD700', fontSize: 14, marginBottom: 4 },
  sourceTag: { color: '#1DB954', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  userNotes: { color: '#888', fontSize: 13, lineHeight: 18 },
  // Aligned the delete button to the top to match the image balance
  deleteButton: { padding: 8, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start' },
  deleteIconText: { fontSize: 18 }
});
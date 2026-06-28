// screens/CommunityScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator } from 'react-native';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function CommunityScreen() {
    const [globalReviews, setGlobalReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const reviewsRef = collection(db, "reviews");
        // Streams the entire collection globally
        const q = query(reviewsRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReviews = [];
            snapshot.forEach((doc) => {
                fetchedReviews.push({ id: doc.id, ...doc.data() });
            });

            // Sort globally: Newest shares at the top
            fetchedReviews.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setGlobalReviews(fetchedReviews);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching global timeline: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>B-Side Feed 🌍</Text>
            <Text style={styles.headerSubtitle}>See what the community is spinning</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#1DB954" style={{ flex: 1 }} />
            ) : globalReviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>The feed is completely quiet...</Text>
                    <Text style={styles.emptySubText}>Be the first to share an album review on B-Side!</Text>
                </View>
            ) : (
                <FlatList
                    data={globalReviews}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.feedCard}>
                            <Image source={{ uri: item.coverArtUrl }} style={styles.albumCover} />

                            <View style={styles.cardContent}>
                                <View style={styles.metaRow}>
                                    <Text style={styles.userTag}>🎧 @{item.username || "music_fan"}</Text>

                                    {/* Global Market Support Tag */}
                                    {item.source && (
                                        <View style={{ backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                                            <Text style={{ color: '#aaa', fontSize: 10, fontWeight: '700' }}>📍 {item.source}</Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.albumName} numberOfLines={1}>{item.albumName}</Text>
                                <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>

                                <Text style={styles.starRating}>{renderStars(item.userRating)}</Text>
                                <Text style={styles.userNotes}>{item.userNotes}</Text>
                            </View>
                        </View>
                    )}
                    style={styles.feedList}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 20, paddingTop: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 14, color: '#888', marginBottom: 20, marginTop: 2 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#aaa', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    emptySubText: { color: '#666', fontSize: 14, textAlign: 'center' },
    feedList: { flex: 1 },
    feedCard: { flexDirection: 'row', backgroundColor: '#1e1e1e', borderRadius: 10, padding: 14, marginBottom: 14, alignItems: 'flex-start', borderWidth: 1, borderColor: '#292929' },
    albumCover: { width: 80, height: 80, borderRadius: 6, marginRight: 15, backgroundColor: '#333' },
    cardContent: { flex: 1 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    userTag: { color: '#1DB954', fontSize: 12, fontWeight: '700' },
    albumName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    artistName: { color: '#aaa', fontSize: 14, marginBottom: 4 },
    starRating: { color: '#FFD700', fontSize: 13, marginBottom: 6 },
    userNotes: { color: '#ccc', fontSize: 13, lineHeight: 18 }
});
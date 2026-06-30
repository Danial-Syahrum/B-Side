import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  const handleRegister = async () => {
    // Clear previous status message
    setStatusMessage({ text: '', isError: false });

    if (!fullName || !username || !email || !password) {
      setStatusMessage({ text: "Please fill out all fields.", isError: true });
      return;
    }

    if (!email.includes('@')) {
      setStatusMessage({ text: "Please enter a valid email address containing '@'.", isError: true });
      return;
    }

    if (password.length < 6) {
      setStatusMessage({ 
        text: "Password is too weak. It must be at least 6 characters long.", 
        isError: true 
      });
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setStatusMessage({ text: "Username is already taken.", isError: true });
        setLoading(false);
        return;
      }

      // add the new user to firebase database
      await addDoc(collection(db, "users"), {
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password, 
        createdAt: serverTimestamp()
      });

      setStatusMessage({ text: "Account created successfully! Redirecting...", isError: false });
      
      // delay redirect to login to allow user to read the success message
      setTimeout(() => {
        navigation.navigate("Login");
      }, 2000);

    } catch (error) {
      setStatusMessage({ text: `Registration Error: ${error.message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.outerContainer} contentContainerStyle={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.title}>Register</Text>
        
        <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} placeholderTextColor="#666"/>
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor="#666"/>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" placeholderTextColor="#666"/>
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#666"/>
        
        {/* display status message if it exists */}
        {statusMessage.text ? (
          <Text style={[styles.statusText, statusMessage.isError ? styles.errorText : styles.successText]}>
            {statusMessage.text}
          </Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>© 2026 B-Side by Danial Syahrum.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#121212' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'space-between', paddingBottom: 20 },
  mainContent: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15 },
  statusText: { textAlign: 'center', fontSize: 14, fontWeight: '600', marginBottom: 15, padding: 5 },
  successText: { color: '#1DB954' }, 
  errorText: { color: '#ff4444' }, 
  button: { backgroundColor: '#1DB954', padding: 15, borderRadius: 8, alignItems: 'center', height: 50, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  linkText: { color: '#888', textAlign: 'center', marginTop: 20 },
  footerText: { color: '#444', fontSize: 11, fontWeight: '600', marginTop: 30, textAlign: 'center', width: '100%' }
});
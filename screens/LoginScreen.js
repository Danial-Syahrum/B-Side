// screens/LoginScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function LoginScreen({ navigation, setUserSession }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // local error message
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  const handleLogin = async () => {
    setStatusMessage({ text: '', isError: false });

    if (!username || !password) {
      setStatusMessage({ text: "Please enter both fields.", isError: true });
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStatusMessage({ text: "Username not found.", isError: true });
        setLoading(false);
        return;
      }

      let userFound = null;
      querySnapshot.forEach((doc) => {
        userFound = { id: doc.id, ...doc.data() };
      });

      if (userFound.password === password) {
        setStatusMessage({ text: "Login successful! Entering B-Side...", isError: false });
        
        // brief delay to allow user read the success message
        setTimeout(() => {
          setUserSession({
            docId: userFound.id,
            username: userFound.username,
            fullName: userFound.fullName
          });
        }, 1000);
      } else {
        setStatusMessage({ text: "Incorrect password. Please try again.", isError: true });
      }
    } catch (error) {
      setStatusMessage({ text: `Login Error: ${error.message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Brand Identity Logo Render */}
      <Image 
        source={require('../assets/bside.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />

      <Text style={styles.title}>B-Side</Text>
      
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor="#666"/>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#666"/>
      
      {/* Dynamic Feedback Notification Text */}
      {statusMessage.text ? (
        <Text style={[styles.statusText, statusMessage.isError ? styles.errorText : styles.successText]}>
          {statusMessage.text}
        </Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#121212' },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 15 },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 30, letterSpacing: 1 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15 },
  statusText: { textAlign: 'center', fontSize: 14, fontWeight: '600', marginBottom: 15 },
  successText: { color: '#1DB954' },
  errorText: { color: '#ff4444' },
  button: { backgroundColor: '#1DB954', padding: 15, borderRadius: 8, alignItems: 'center', height: 50, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  linkText: { color: '#888', textAlign: 'center', marginTop: 20 }
});
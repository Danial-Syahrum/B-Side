// screens/RegisterScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // state for loading and status message
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  const handleRegister = async () => {
    // Clear previous status message
    setStatusMessage({ text: '', isError: false });

    if (!fullName || !username || !email || !password) {
      setStatusMessage({ text: "Please fill out all fields.", isError: true });
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
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#121212' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15 },
  statusText: { textAlign: 'center', fontSize: 14, fontWeight: '600', marginBottom: 15, padding: 5 },
  successText: { color: '#1DB954' }, 
  errorText: { color: '#ff4444' }, 
  button: { backgroundColor: '#1DB954', padding: 15, borderRadius: 8, alignItems: 'center', height: 50, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  linkText: { color: '#888', textAlign: 'center', marginTop: 20 }
});
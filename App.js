import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { doc, getDoc } from 'firebase/firestore';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import AboutScreen from './screens/AboutScreen';
import AddReviewScreen from './screens/AddReviewScreen';
import CommunityScreen from './screens/CommunityScreen';

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HeaderLogo() {
  return (
    <Image 
      source={require('./assets/bside.png')} 
      style={styles.headerLogoImage} 
      resizeMode="contain"
    />
  );
}

function AppTabs({ userSession, setUserSession }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        //position the label below the icon
        tabBarLabelPosition: 'below-icon',

        // Icon for the bar
        tabBarIcon: ({ color }) => {
          if (route.name === 'Home') {
            return (
              <View style={[styles.iconBox, { borderColor: color }]}>
                <View style={[styles.iconInnerBar, { backgroundColor: color }]} />
              </View>
            );
          } else if (route.name === 'Community') {
            return (
              <View style={[styles.iconCircle, { borderColor: color, justifyContent: 'center', alignItems: 'center' }]}>
                <View style={[styles.iconEarthLat, { borderColor: color }]} />
                <View style={[styles.iconEarthLng, { borderColor: color }]} />
              </View>
            );
          } else if (route.name === 'Search') {
            return (
              <View style={[styles.iconCircle, { borderColor: color }]}>
                <View style={[styles.iconHandle, { backgroundColor: color }]} />
              </View>
            );
          } else if (route.name === 'About') {
            return (
              <View style={[styles.iconCircle, { borderColor: color }]}>
                <View style={[styles.iconDot, { backgroundColor: color }]} />
              </View>
            );
          }
          return null;
        },

        //tab bar styling
        tabBarStyle: {
          backgroundColor: '#1e1e1e',
          borderTopColor: '#333',
          height: 75,
          paddingTop: 10,
          paddingBottom: 0
        },

        // tab bar label styling
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4
        },

        tabBarActiveTintColor: '#1DB954', 
        tabBarInactiveTintColor: '#888',  
        headerStyle: { backgroundColor: '#121212', borderBottomColor: '#333' },
        headerTitleStyle: { color: '#fff', fontWeight: 'bold' },
        
        // render logo on right header
        headerRight: () => <HeaderLogo />,
      })}
    >
      <Tab.Screen name="Home" options={{ title: 'Tracklist' }}>
        {(props) => <HomeScreen {...props} userSession={userSession} setUserSession={setUserSession} />}
      </Tab.Screen>
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Community' }}/>
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Find Music' }} />
      <Tab.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [userSession, setUserSession] = useState(null);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {userSession ? (
          <>
            <RootStack.Screen name="MainTabs">
              {(props) => <AppTabs {...props} userSession={userSession} setUserSession={setUserSession} />}
            </RootStack.Screen>

            <RootStack.Screen
              name="AddReviewScreen"
              options={{
                headerShown: true,
                title: 'Review',
                headerStyle: { backgroundColor: '#121212', borderBottomColor: '#333' },
                headerTitleStyle: { color: '#fff' },
                headerTintColor: '#1DB954',
                headerRight: () => <HeaderLogo />,
              }}
            >
              {(props) => <AddReviewScreen {...props} userSession={userSession} />}
            </RootStack.Screen>
          </>
        ) : (
          <>
            <RootStack.Screen name="Login">
              {(props) => <LoginScreen {...props} setUserSession={setUserSession} />}
            </RootStack.Screen>
            <RootStack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconBox: { width: 18, height: 16, borderWidth: 2, borderRadius: 3, justifyContent: 'center', alignItems: 'center' },
  iconInnerBar: { width: 10, height: 2, borderRadius: 1 },
  iconCircle: { width: 16, height: 16, borderWidth: 2, borderRadius: 8, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  iconHandle: { width: 2, height: 5, position: 'absolute', bottom: -4, right: -3, transform: [{ rotate: '-45deg' }] },
  iconDot: { width: 4, height: 4, borderRadius: 2 },
  iconEarthLat: { width: 12, height: 6, borderWidth: 1, borderLeftWidth: 0, borderRightWidth: 0, borderRadius: 3, position: 'absolute' },
  iconEarthLng: { width: 6, height: 12, borderWidth: 1, borderTopWidth: 0, borderBottomWidth: 0, borderRadius: 3, position: 'absolute' },
  headerLogoImage: { width: 28, height: 28, marginRight: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }
});
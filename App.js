import React, { useEffect, useState, useRef, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform } from 'react-native';
import Login from './screens/auth/Login';
import Register from './screens/auth/Register';
import Home from './screens/Home';
import Profile from './screens/Profile';
import Calls from './screens/Calls';
import Chat from './screens/chats/Chat';
import Chats from './screens/chats/Chats';
import VideoCall from './screens/call/VideoCall';
import Payment from './screens/Payment';
import Subscriptions from './screens/Subscriptions';
import Checkout from './screens/Checkout';
import { MainProvider } from './others/MyContext';
import Notification from './screens/Notifications';
import SplashScreen from './others/SplashScreen';
import Search from './screens/Search';
import { MainContext } from './others/MyContext';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const navigationRef = useRef();
  const { setDeviceToken } = useContext(MainContext);

  // Notification state
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(()=>{
    console.log('Device token:', expoPushToken);
    if (expoPushToken){
      setDeviceToken(expoPushToken);
    }
  }, [expoPushToken]);
  
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    // Set up listeners for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Optionally handle foreground notifications here
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const userName = response.notification.request.content.title;
      if (userName) {
        navigationRef.current?.navigate('Chat', { userName: userName });
      }
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }

  // Check user logged in or not start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const authToken = await AsyncStorage.getItem('auth_token');
        setIsLoggedIn(!!authToken);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);
  // Check user logged in or not end

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Loading start
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='#800925' />
      </View>
    );
  }
  // Loading end

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Login'}
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}>
          <Stack.Screen name='Home' component={Home} />
          <Stack.Screen name='Login' component={Login} />
          <Stack.Screen name='Register' component={Register} />
          <Stack.Screen name='Profile' component={Profile} />
          <Stack.Screen name='Chats' component={Chats} />
          <Stack.Screen name='Calls' component={Calls} />
          <Stack.Screen name='Chat' component={Chat} />
          <Stack.Screen name='VideoCall' component={VideoCall} />
          <Stack.Screen name='Payment' component={Payment} />
          <Stack.Screen name='Subscriptions' component={Subscriptions} />
          <Stack.Screen name='Checkout' component={Checkout} />
          <Stack.Screen name='Notification' component={Notification} />
          <Stack.Screen name='Search' component={Search} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppWrapper() {
  return (
    <MainProvider>
      <App />
    </MainProvider>
  );
}

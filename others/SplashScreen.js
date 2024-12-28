import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, Text, StyleSheet } from 'react-native';


const SplashScreen = ({ onFinish }) => {
  const [callStatus, setCallStatus] =  useState(false);

  const fetchCallStatus = async()=>{
    const status = await AsyncStorage.getItem('call');
    if (status){
      setCallStatus(true);
    }
  };

  const removeCall = async()=>{
    await AsyncStorage.removeItem('call');
  };

  useEffect(() => {
    fetchCallStatus();
    const timer = setTimeout(() => {
      removeCall();
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {callStatus ? (
        <Text style={styles.connectingText}>Connecting...</Text>
      ) : (
        <>
          <Image
            source={require('./../assets/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.text}>Mr Weds Mrs</Text>
          <ActivityIndicator size="large" color="#800925" style={styles.loader} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ebebeb',
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800925',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  connectingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800925',
    textAlign: 'center',
  },
});

export default SplashScreen;

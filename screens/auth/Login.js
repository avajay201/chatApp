import React, { useState, useContext } from 'react';
import { View, Text, TextInput, BackHandler, TouchableOpacity, StyleSheet, ActivityIndicator, ToastAndroid } from 'react-native';
import * as Animatable from 'react-native-animatable';
import ErrorMessage from '../comps/ErrorMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userLogin } from '../../actions/APIActions';
import { MainContext } from '../../others/MyContext';
import { useFocusEffect } from '@react-navigation/native';


export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [exitApp, setExitApp] = useState(false);
  const [error, setError] = useState('');
  const { setIsLogged, deviceToken } = useContext(MainContext);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (exitApp) {
          BackHandler.exitApp();
          return true;
        } else {
          setExitApp(true);
          ToastAndroid.show('Press again to exit the app', ToastAndroid.SHORT);

          setTimeout(() => {
            setExitApp(false);
          }, 2000);

          return true;
        }
      };

      // Add the back button listener
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      // Remove the listener when screen loses focus or unmounts
      return () => backHandler.remove();
    }, [exitApp])
  );

  // Handle login start
  const handleLogin = async() => {
    setError('');
    if (!email || !password) {
        setError('Username and password are required fields.');
        return;
    };

    setLoading(true);
    const loginData = {email: email, password: password, device_token: deviceToken};
    const response = await userLogin(loginData,);
    if (response[0] === 400){
      setError(response[1]);
    }
    else if(response[0] === 200){
      await AsyncStorage.setItem('auth_token', response[1]?.access);
      await AsyncStorage.setItem('auth_user', response[1]?.username);
      setLoading(false);
      ToastAndroid.show('Login successfully.', ToastAndroid.SHORT);
      setIsLogged(true);
      navigation.replace('Home');
    }
    else{
      setError('Something went wrong.');
    }
    setLoading(false);
  };
  // Handle login end

  // Clear error start
  const clearError = () => {
    if (error) {
      setError('');
    };
  };
  // Clear error end

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" duration={1500} style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" duration={1500} style={styles.footer}>
        {error ? <ErrorMessage message={error} /> : null}
        <Text style={styles.label}>Email/Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email/username"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearError();
          }}
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearError();
          }}
          editable={!loading}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#800925" style={styles.loader} />
        ) : (
        <Animatable.View animation="zoomIn" duration={1500}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </Animatable.View>
        )}
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#800925',
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  footer: {
    flex: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  label: {
    color: '#800925',
    fontSize: 18,
    marginTop: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#800925',
    marginBottom: 20,
    fontSize: 16,
    paddingBottom: 5,
    color: '#05375a',
  },
  button: {
    backgroundColor: '#800925',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    color: '#800925',
    textAlign: 'center',
  },
  disabledText: {
    color: '#d3d3d3',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, ActivityIndicator } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Avatar } from './comps/chats/Avatar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MyLayout from './MyLayout';
import Icon from "react-native-vector-icons/Ionicons";
import { getCalls } from '../actions/APIActions';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../actions/API';


export default function Calls({ navigation }) {
  const [searchKey, setSearchKey] = useState('');
  const [user, setUser] = useState(null);
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAuth = async () => {
    const auth_user = await AsyncStorage.getItem("auth_user");
    if (!auth_user) {
      ToastAndroid.show("Session expired, please login.", ToastAndroid.SHORT);
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
      navigation.navigate("Login");
      return;
    }
    setUser(auth_user);
  };

  const myCalls = async () => {
    setLoading(true);
    const result = await getCalls();
    if (result[0] === 200) {
      console.log('result[1]>>>>', result[1]);
      setCalls(result[1]);
      setFilteredCalls(result[1]);
    } else if (result[0] === 401) {
      ToastAndroid.show("Session expired, please login.", ToastAndroid.SHORT);
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
      navigation.navigate("Login");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      myCalls();
    }
  }, [user]);

  useEffect(() => {
    fetchAuth();
  }, []);

  const handleChat = (name) => {
    navigation.navigate('Chat', { userName: name });
  };

  const handleCall = (name, callType, userId) => {
    // const callAction = callType === 'video' ? 'video call' : 'voice call';
    navigation.navigate('VideoCall', { userName: name, user: user, status: 'out', user_id: userId });
    // ToastAndroid.show(`Start ${callAction} with ${name}`, ToastAndroid.SHORT);
  };

  const renderItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 100}
    >
      <TouchableOpacity style={styles.callItem}>
        <Avatar src={item.profile_picture ? BASE_URL + item.profile_picture : null} name={item.receiver} is_url={item.profile_picture ? true : false} />
        <View style={styles.callDetails}>
          <Text style={styles.callName}>{item.caller === user ? item.receiver : item.caller}</Text>
          <Text style={styles.callTime}>
            {item.caller === user ? 'You called' : 'Incoming call'} at {item.call_time}
          </Text>
        </View>
        <View style={styles.callActions}>
          <TouchableOpacity onPress={() => handleChat(item.caller === user ? item.receiver : item.caller)}>
            <MaterialIcons name="chat" size={24} color="#009387" style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCall(item.caller === user ? item.receiver : item.caller, item.call_type, item.caller === user ? item.receiver_id : item.caller_id)}>
            {item.call_type === 'Video' ? (
              <Ionicons name="videocam" size={24} color="#009387" style={styles.actionIcon} />
            ) : (
              <Ionicons name="call" size={24} color="#009387" style={styles.actionIcon} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const filterChats = () => {
    const fCalls = calls.filter(call => call.caller.toLowerCase().includes(searchKey.toLowerCase()));
    setFilteredCalls(fCalls);
  };

  useEffect(() => {
    filterChats();
  }, [searchKey]);

  return (
    <MyLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Icon onPress={() => navigation.navigate('Chats')} name="chatbox-outline" size={24} color="#800925" />
            <Icon name="call" size={24} color="#800925" />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search a user"
              value={searchKey}
              onChangeText={setSearchKey}
            />
            <Icon name="search" size={20} color="#800925" />
          </View>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#800925" style={styles.loader} />
        ) : filteredCalls.length === 0 ? (
          <View style={styles.noCallsContainer}>
            <Text style={styles.noCallsText}>No Calls</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCalls}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </MyLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 35,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#800925",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  input: {
    height: 50,
    flex: 1,
    paddingHorizontal: 10,
  },
  callItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 1,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  callDetails: {
    flex: 1,
    marginLeft: 10,
  },
  callName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  callTime: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  callActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginHorizontal: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCallsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCallsText: {
    fontSize: 18,
    color: '#999',
  },
});

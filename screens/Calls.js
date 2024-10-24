import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ToastAndroid } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Avatar } from './comps/chats/Avatar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MyLayout from './MyLayout';
import Icon from "react-native-vector-icons/Ionicons";


export default function Calls({navigation}) {
  const [searchKey, setSearchKey] = useState('');
  const calls = [
    { 
      id: '1', 
      username: 'alicejohnson', 
      callTime: '10:30 AM', 
      avatar: '', 
      callType: 'voice',
      callDirection: 'outgoing',
    },
    { 
      id: '2', 
      username: 'bobSmith', 
      callTime: 'Yesterday', 
      avatar: '', 
      callType: 'video', 
      callDirection: 'incoming',
    },
    { 
      id: '3', 
      username: 'charliebrown', 
      callTime: 'Monday', 
      avatar: '', 
      callType: 'voice', 
      callDirection: 'outgoing',
    },
    { 
      id: '4', 
      username: 'dianaprince', 
      callTime: 'Tuesday', 
      avatar: '', 
      callType: 'video', 
      callDirection: 'incoming',
    },
  ];
  const [filteredCalls, setFilteredCalls] = useState(calls);

  const handleChat = (name) => {
    // navigation.navigate('Chat', { userName: name });
    ToastAndroid.show(`Start chat with ${name}`, ToastAndroid.SHORT);
  };
  
  const handleCall = (name, callType) => {
    const callAction = callType === 'video' ? 'video call' : 'voice call';
    ToastAndroid.show(`Start ${callAction} with ${name}`, ToastAndroid.SHORT);
  };

  const renderItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 100}
    >
      <TouchableOpacity style={styles.callItem}>
        <Avatar src={item.avatar} name={item.username} is_url={false} />
        <View style={styles.callDetails}>
          <Text style={styles.callName}>{item.username}</Text>
          
          <Text style={styles.callTime}>
            {item.callDirection === 'outgoing' ? 'You called' : 'Incoming call'} at {item.callTime}
          </Text>
        </View>

        <View style={styles.callActions}>
          <TouchableOpacity onPress={() => handleChat(item.username)}>
            <MaterialIcons name="chat" size={24} color="#009387" style={styles.actionIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleCall(item.username, item.callType)}>
            {item.callType === 'video' ? (
              <Ionicons name="videocam" size={24} color="#009387" style={styles.actionIcon} />
            ) : (
              <Ionicons name="call" size={24} color="#009387" style={styles.actionIcon} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const filterChats = ()=>{
    const fCalls = calls.filter(call => call.username.toLowerCase().includes(searchKey.toLowerCase()));
    setFilteredCalls(fCalls);
  }

  useEffect(()=>{
    filterChats();
  }, [searchKey]);

  return (
    <MyLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
          <Icon onPress={()=> navigation.navigate('Chats')} name="chatbox-outline" size={40} color="#800925" />
          <Icon name="call" size={40} color="#800925" />
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
        <FlatList
          data={filteredCalls}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
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
});

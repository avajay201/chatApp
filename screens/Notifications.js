import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { messageNotifications } from "../actions/APIActions";
import { useFocusEffect } from '@react-navigation/native';


export default function Notification({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const getNotification = async () => {
    const result = await messageNotifications();
    if (result[0] === 200) {
      setNotifications(result[1]);
    } else if (result[0] === 401) {
      ToastAndroid.show("Session expired, please login.", ToastAndroid.SHORT);
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
      navigation.navigate("Login");
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      getNotification();
    }, [])
  );

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationContainer,
        item.read ? styles.readNotification : styles.unreadNotification,
      ]}
      onPress={()=> navigation.navigate('Chat', { userName: item.sender })}
    >
      <Text style={styles.notificationTitle}>{item.sender} sent a message</Text>
      <Text style={styles.notificationTime}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#800925" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.noNotificationsContainer}>
          <Text style={styles.noNotificationsText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  notificationContainer: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  readNotification: {
    backgroundColor: "#eaeaea",
  },
  unreadNotification: {
    backgroundColor: "#ffecb3",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noNotificationsText: {
    fontSize: 18,
    color: "#999",
  },
});

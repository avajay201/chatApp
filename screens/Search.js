import React, { useState } from "react";
import MyLayout from "./MyLayout";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Image,
} from "react-native";
import { searchUser } from "./../actions/APIActions";
import Icon from "react-native-vector-icons/Ionicons";
import { METRI_MEDIA_URL } from "../actions/API";


export default Search = () => {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchedUser, setSearchedUser] = useState(null);
  const [noUser, setNoUser] = useState(false);

  const handleUserSearch = async () => {
    if (!userId) {
      return;
    }
    setSearchedUser(null);
    setNoUser(false);
    setLoading(true);
    const result = await searchUser(1, userId);
    console.log("result>>>", result);
    if (result[0] === 200) {
      setSearchedUser(result[1][0]);
    } else if (result[0] === 404) {
      setNoUser(true);
    } else if (result[0] === 403) {
      ToastAndroid.show(result[1], ToastAndroid.SHORT);
    } else {
      ToastAndroid.show("Something went wrong!", ToastAndroid.SHORT);
    }
    setLoading(false);
  };

  return (
    <MyLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search by user ID"
              value={userId}
              onChangeText={setUserId}
            />
            <TouchableOpacity
              disabled={!userId}
              onPress={handleUserSearch}
              style={styles.iconContainer}
            >
              <Icon name="search" size={20} color="#800925" />
            </TouchableOpacity>
          </View>
        </View>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#800925" />
          </View>
        )}

        {noUser && (
          <View style={styles.noUser}>
            <Text style={styles.noUserTest}>User not found!</Text>
          </View>
        )}

        {searchedUser && !loading && (
          <View style={styles.userDetailsContainer}>
            <Image 
              source={{ uri: METRI_MEDIA_URL + searchedUser.profile_picture }} 
              style={styles.profilePicture} 
            />
            <Text style={styles.userName}>{searchedUser.username}</Text>
            
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Name:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.first_name} {searchedUser.last_name}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Profile for:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.profile_for}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Religion:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.religion}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Living in:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.living_in}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Gender:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.gender}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Community:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.community}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Time of Birth:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.time_of_bith}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Education:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.education}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Height:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.height}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Income:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.income}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Marital Status:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.marital_status}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Occupation:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.occupation}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Skin Tone:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.skin_tone}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Alcoholic:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.alcoholic}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userInfoLabel}>Smoker:</Text>
              <Text style={styles.userInfoValue}>{searchedUser.smoker}</Text>
            </View>
            <Text style={styles.userAboutLabel}>About:</Text>
            <Text style={styles.userAboutValue}>{searchedUser.about_me}</Text>
          </View>
        )}
      </View>
    </MyLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    marginTop: 35,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#800925",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    height: 50,
    flex: 1,
    paddingHorizontal: 10,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
  },
  loaderContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  noUser: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  noUserTest: {
    fontSize: 20,
    fontWeight: "bold",
  },
  userDetailsContainer: {
    marginTop: 20,
    padding: 15,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userInfoLabel: {
    fontSize: 16,
    color: '#555',
  },
  userInfoValue: {
    fontSize: 16,
    color: '#000',
  },
  userAboutLabel: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  userAboutValue: {
    textAlign: 'center'
  },
});

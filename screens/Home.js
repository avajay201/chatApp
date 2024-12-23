import React, { useEffect, useContext, useState, useCallback } from 'react';
import { View, Text,Modal, StyleSheet, TextInput, Button, Linking, TouchableOpacity, ActivityIndicator, ToastAndroid, Image, FlatList, Dimensions } from 'react-native';
import { MainContext } from '../others/MyContext';
import MyLayout from './MyLayout';
import Icon from 'react-native-vector-icons/Ionicons';
import { userProfile, searchUser, userSuggestions, messageNotifications } from './../actions/APIActions';
import { METRI_MEDIA_URL, USER_SUGGESTION_URL } from '../actions/API';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar } from './comps/chats/Avatar';
import { BASE_URL } from '../actions/API';


export default function Home({ navigation }) {
  const { setIsLogged, callPicked, setCallPicked, wsData } = useContext(MainContext);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedUser, setSearchedUser] = useState(null);
  const userData = [
    {
      id: 1,
      images: ['https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=600'],
      username: 'ajayvortex',
      custom_id: 'ID1001',
      first_name: 'John',
      last_name: 'Doe',
      religion: 'Christianity',
      living_in: 'New York',
      gender: 'Male',
      community: 'Community A',
      marital_status: 'Single',
    },
    {
      id: 2,
      images: ['https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=600'],
      username: 'vermaverse',
      custom_id: 'ID1002',
      first_name: 'Emma',
      last_name: 'Smith',
      religion: 'Islam',
      living_in: 'London',
      gender: 'Female',
      community: 'Community B',
      marital_status: 'Married',
    },
    {
      id: 3,
      images: ['https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=600'],
      username: 'zenajay',
      custom_id: 'ID1003',
      first_name: 'Raj',
      last_name: 'Patel',
      religion: 'Hinduism',
      living_in: 'Mumbai',
      gender: 'Male',
      community: 'Community C',
      marital_status: 'Single',
    },
    {
      id: 4,
      images: ['https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=600'],
      username: 'cosmicverma',
      custom_id: 'ID1004',
      first_name: 'Aya',
      last_name: 'Suzuki',
      religion: 'Buddhism',
      living_in: 'Tokyo',
      gender: 'Female',
      community: 'Community A',
      marital_status: 'Divorced',
    },
    {
      id: 5,
      images: ['https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=600'],
      username: 'ajaynova',
      custom_id: 'ID1005',
      first_name: 'Liam',
      last_name: 'Johnson',
      religion: 'Judaism',
      living_in: 'Berlin',
      gender: 'Male',
      community: 'Community B',
      marital_status: 'Married',
    },
    {
      id: 6,
      images: ['https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=600'],
      username: 'vermaecho',
      custom_id: 'ID1006',
      first_name: 'Olivia',
      last_name: 'Brown',
      religion: 'Christianity',
      living_in: 'New York',
      gender: 'Female',
      community: 'Community C',
      marital_status: 'Single',
    },
    {
      id: 7,
      images: ['https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=600'],
      username: 'mysticajay',
      custom_id: 'ID1007',
      first_name: 'Noah',
      last_name: 'Davis',
      religion: 'Islam',
      living_in: 'London',
      gender: 'Male',
      community: 'Community A',
      marital_status: 'Married',
    },
    {
      id: 8,
      images: ['https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=600'],
      username: 'quantumverma',
      custom_id: 'ID1008',
      first_name: 'Sophia',
      last_name: 'Garcia',
      religion: 'Hinduism',
      living_in: 'Mumbai',
      gender: 'Female',
      community: 'Community B',
      marital_status: 'Divorced',
    },
    {
      id: 9,
      images: ['https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=600'],
      username: 'ajayfusion',
      custom_id: 'ID1009',
      first_name: 'Mason',
      last_name: 'Martinez',
      religion: 'Buddhism',
      living_in: 'Tokyo',
      gender: 'Male',
      community: 'Community C',
      marital_status: 'Single',
    },
    {
      id: 10,
      images: ['https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=600'],
      username: 'vermanexus',
      custom_id: 'ID1010',
      first_name: 'Isabella',
      last_name: 'Wilson',
      religion: 'Judaism',
      living_in: 'Berlin',
      gender: 'Female',
      community: 'Community A',
      marital_status: 'Married',
    },
  ]
  const [suggestionsdata, setSuggestionsData] = useState(userData);
  const [noUser, setNoUser] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({});

  // Get profile start
  const fetchProfile = async()=>{
    const response = await userProfile();
    if (!response){
      ToastAndroid.show('Something went wrong.', ToastAndroid.SHORT);
      return
    }
    if (response[0] === 200){
      setProfileData(response[1]);
    }
    else if(response[0] === 401){
      ToastAndroid.show('Session expired, please login.', ToastAndroid.SHORT);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      navigation.navigate('Login');
    }
    else{
      ToastAndroid.show('Something went wrong.', ToastAndroid.SHORT);
    }
  };

  useEffect(()=>{
    if (!wsData){
      return;
    }
    const status = wsData['status'];
    if (status === 'msg') {
      setNotificationsCount(wsData['notifications']);
    }
  }, [wsData]);

  const getNotification = async () => {
    const auth_user = await AsyncStorage.getItem("auth_user");
    setUser(auth_user);
    const result = await messageNotifications();
    if (!result){
      ToastAndroid.show('Something went wrong.', ToastAndroid.SHORT);
      return
    }
    if (result[0] === 200) {
      setNotificationsCount(result[1].length);
    } else if (result[0] === 401) {
      ToastAndroid.show("Session expired, please login.", ToastAndroid.SHORT);
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
      navigation.navigate("Login");
    }
  };

  useEffect(()=>{
    if (callPicked){
      navigation.navigate('VideoCall', { userName: callPicked, user: 'test202', status: 'in' });
      setCallPicked(false);
    }
  }, [callPicked]);

  useFocusEffect(
    useCallback(() => {
      getNotification();
      fetchProfile();
    }, [])
  );

  useEffect(() => {
    setIsLogged(true);
    getNotification();

    const suggestions = async()=>{
      setLoading(true);
      const data = {family_name: '', living_in: '', religion: ''};
      const result = await userSuggestions(data);
      if (result && result[0] === 200){
        setSuggestionsData(result[1]);
      }
      setLoading(false);
    }

    if (!userId){
      setNoUser(false);
      setSearchedUser(null);
      setLoading(true);
      setTimeout(()=>{
        setSuggestionsData(userData);
        setLoading(false);
      }, 1500);
    }
  }, []);

  const openWebsite = () => {
    const url = 'https://www.mrwedsmrs.com';
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  const ProfileCard = ({ profile }) => {
    return (
      <TouchableOpacity style={styles.userSuggestionsContainer} >
        
        <Image 
          source={profile.images.length > 0 ? { uri: profile.images[0] } : require('../assets/profile.png')} 
          style={styles.userProfilePicture}
        />
        <Text style={styles.userSuggestionName}>{profile.username}</Text>

        <View style={styles.userSuggestionDeatils}>
          <Text style={styles.userSuggestionInfoLabel}>ID:</Text>
          <Text style={styles.userSuggestionInfoValue}>{profile.custom_id}</Text>
        </View>

        <View style={styles.userSuggestionDeatils}>
          <Text style={styles.userSuggestionInfoLabel}>Name:</Text>
          <Text style={styles.userSuggestionInfoValue}>{profile.first_name} {profile.last_name}</Text>
        </View>

        <View style={styles.userSuggestionDeatils}>
          <Text style={styles.userSuggestionInfoLabel}>Religion:</Text>
          <Text style={styles.userSuggestionInfoValue}>{profile.religion}</Text>
        </View>

        <View style={styles.userSuggestionDeatils}>
          <Text style={styles.userSuggestionInfoLabel}>Location:</Text>
          <Text style={styles.userSuggestionInfoValue}>{profile.living_in}</Text>
        </View>

        <View style={styles.userSuggestionDeatils}>
          <Text style={styles.userSuggestionInfoLabel}>Gender:</Text>
          <Text style={styles.userSuggestionInfoValue}>{profile.gender}</Text>
        </View>

        <View style={styles.userSuggestionDeatils}>
          <Text style={styles.userSuggestionInfoLabel}>Community:</Text>
          <Text style={styles.userSuggestionInfoValue}>{profile.community}</Text>
        </View>

        <View style={styles.userSuggestionDeatils}>
          <Text style={styles.userSuggestionInfoLabel}>Marital Status:</Text>
          <Text style={styles.userSuggestionInfoValue}>{profile.marital_status}</Text>
        </View>

        <View style={styles.profileCardOption}>
          <View style={styles.profileCardOptionBtn}>
            <Text style={styles.profileCardOptionBtnText} onPress={openWebsite}>Connect</Text>
          </View>
          <View style={styles.profileCardOptionBtn}>
            <Text style={styles.profileCardOptionBtnText} onPress={openWebsite}>Chat</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MyLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.activeUserContainer} onPress={()=>navigation.navigate('Profile')}>
            <Avatar
              src={profileData?.profile_picture ? profileData.profile_picture : null}
              name={profileData?.username ? profileData?.username : 'A'}
              is_url={profileData?.profile_picture ? true : false}
              style={styles.activeUserAvatar}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.upgradeCont} onPress={() => navigation.navigate('Subscriptions')}>
            <Text style={styles.upgradeText}>Upgrade</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notification')} style={styles.bellIconContainer}>
              <Icon name="notifications-outline" size={30} color="white" />
              {notificationsCount > 0 && (
                <View style={styles.notificationCount}>
                  <Text style={styles.notificationText}>{notificationsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
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

        {/* User suggestions */}
        {
          suggestionsdata.length > 0 &&  !loading && !searchedUser && !noUser ?
          <View style={styles.profileCardCont}>
          <FlatList
            data={suggestionsdata}
            renderItem={({ item }) => <ProfileCard profile={item} />}
            keyExtractor={(item) => item.id.toString()}
            horizontal={true}
            snapToInterval={Dimensions.get('window').width}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          />
          </View>
          :
          !searchedUser && null
        }

        {/* User details */}
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
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop:0,
  },
  header: {
    width: '100%',
    paddingVertical: 50,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#800925',
    position: 'relative',
    top:0
  },
  activeUserContainer: {
    position: 'absolute',
    top: 50,
    left: 15,
  },
  activeUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  upgradeCont: {
    position: 'absolute',
    top: 50,
    right: 70,
    backgroundColor: '#fff',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 7,
  },
  upgradeText: {
    color: '#800925',
    fontWeight: 'bold',
  },
  bellIconContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
  },
  notificationCount: {
    position: 'absolute',
    right: 0,
    top: -5,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#800925',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loaderContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  noUser: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  noUserTest: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileCardOption: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 30,
  },
  profileCardOptionBtn: {
    paddingVertical: 10,
    backgroundColor: '#800925',
    width: 100,
    borderRadius: 10,
    alignItems: 'center',
  },
  profileCardOptionBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userSuggesionsContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.1,
    elevation: 3,
  },
  // user suggestions start
  profileCardCont: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userSuggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 50,
    marginHorizontal: 0,
    width: width,
    alignItems: 'center',
  },
  userProfilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  userSuggestionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  userSuggestionDeatils: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    width: '100%',
    paddingRight: 40,
  },
  userSuggestionInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  userSuggestionInfoValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333',
  },
  // user suggestions end
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
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    color: '#333',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    alignItems: 'center',
    elevation: 10, // Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 }, // iOS shadow
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333333',
  },

  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555555',
    marginBottom: 20,
  },
  linkText: {
    color: '#1e90ff',
    textDecorationLine: 'underline',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#800925',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

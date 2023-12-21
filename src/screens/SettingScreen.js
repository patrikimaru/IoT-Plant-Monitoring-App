import { AccountSettingsList } from '../data/AccountSettingsList';
import { useState, useEffect } from 'react';
import { auth , db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";
import { useNavigation } from '@react-navigation/core';
import {
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  View,
  Alert,
  Pressable,
  FlatList,
  StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChangeInfoModal from '../components/modals/ChangeInfoModal';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';


export default function SettingScreen() {
  const authUser = auth.currentUser
  const storage = getStorage();
  const navigation = useNavigation();
  const [image, setImage] = useState(null)
  const [userData, setUserData] = useState(null);
  const [uploading, setUploading] = useState(false)
  const [changeInfoModalVisible, setChangeInfoModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

  const uploadImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.cancelled && result.uri) {
      Alert.alert(
        "Change Profile Picture",
        "Do you want to change your profile picture?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
  
              const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                  resolve(xhr.response);
                };
                xhr.onerror = function () {
                  reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', result.uri, true);
                xhr.send(null);
              });
  
              const storageRef = ref(storage, 'user/profilePic');
              const snapshot = uploadBytes(storageRef, blob);
  
              snapshot
                .then(() => {
                  setUploading(false);
                })
                .catch((error) => {
                  setUploading(false);
                  console.log(error);
                  return;
                });
  
              snapshot.then(async () => {
                const url = await getDownloadURL(storageRef);
                setImage(url);
  
                const userDocRef = doc(db, "users", authUser.uid);
                setDoc(userDocRef, { profilePicture: url }, { merge: true })
                  .then(() => {
                    Alert.alert("You have successfully updated your Profile Picture!");
                  })
                  .catch((error) => {
                    Alert.alert("Error uploading Profile Picture!");
                    console.log(error)
                  });
                return url;
              });
            },
          },
        ]
      );
    }
  };
  

  const fetchUserData = async () => {
    try {
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
  
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setUserData(userData);
        } else {
          Alert.alert('User document does not exist');
        }
      } else {
        Alert.alert('User is not authenticated');
      }
    } catch (error) {
      Alert.alert('Error fetching user data:', error);
    }
  };
  
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await signOut(auth);
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleSettingPress = (item) => {
    if (item.label === 'Edit Personal Information') {
      setChangeInfoModalVisible(true);
    } else if (item.label === 'Change Password') {
      setChangePasswordModalVisible(true);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={SettingStyles.cardSettingsBtn}
      onPress={() => handleSettingPress(item)}
    >
      <View style={SettingStyles.cardSettingsBtnLabel}>
        <Ionicons name={item.icon} size={18} />
        <Text>{item.label}</Text>
      </View>
      <Ionicons name="arrow-forward-outline" size={25} color="#191919" />
    </Pressable>
  );

  const keyExtractor = (item, index) => index.toString();


  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  
  useEffect(() => {
    fetchUserData();
  }, []);

  
  return (
    <SafeAreaView style={SettingStyles.container}>
          <View style={SettingStyles.container}>
            <TouchableOpacity style={SettingStyles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back-outline" size={30} />

            </TouchableOpacity>
            {userData ? (
                <Image 
                    source={{ uri: image || (userData && userData.profilePicture) || 'https://i.stack.imgur.com/l60Hf.png' }} 
                    style={SettingStyles.userProfile}
                />
            ) : (
                <ActivityIndicator size="large" color="black" />
            )}
            <TouchableOpacity  onPress={uploadImage} style={SettingStyles.editProfile}>
                <Ionicons name="pencil-outline" size={20} />
            </TouchableOpacity>


            <Text style={SettingStyles.name}>
              {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
            </Text>
            {authUser ? <Text style={SettingStyles.email}>{authUser.email}</Text> : null}
          </View>
          <View style={SettingStyles.cardContainer}>
            <Text style={SettingStyles.title}>Account Settings</Text>
            <View style={SettingStyles.cardSettings}>
              <FlatList
                data={AccountSettingsList}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
              />
            </View>
          </View>
          <TouchableOpacity style={SettingStyles.logoutBtn} onPress={handleLogout}>
            <Text style={SettingStyles.logoutText}>Logout</Text>
          </TouchableOpacity>
      <ChangeInfoModal
        visible={changeInfoModalVisible}
        onClose={() => setChangeInfoModalVisible(false)}
      />

      <ChangePasswordModal
        visible={changePasswordModalVisible}
        onClose={() => setChangePasswordModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const SettingStyles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      display: 'flex',
      alignItems:'center',
    },
    editProfile: {
        width: 40,
        height: 40,
        marginRight: -50,
        marginTop: -50,
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    backBtn: {
      alignSelf: 'flex-start',
      margin: 20
    },
    userProfile: {
      width: 150,
      height: 150,
      borderRadius: 300,
      marginBottom: 20,
    },
    cardContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent:'flex-start',
      marginTop: 20,
      padding:20,
      alignSelf: 'stretch',
    },
    cardSettings: {
      alignSelf: 'stretch',
      padding: 8,
      borderWidth: 2,
      borderRadius: 12,
      borderColor: 'gray',
      backgroundColor: '#fafafa',
    },
    name: {
      fontSize: 24,
      marginTop: 20,
      fontWeight: '600',
      fontWeight:'bold',
    },
    title: {
      fontSize: 18,
      marginBottom: 8,
    },
    cardSettingsBtn: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      fontSize: 20
    },
    cardSettingsBtnLabel: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: "center",
      gap: 8
    },
    logoutBtn: {
      margin: 20,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: '#FF3D3D',
      borderRadius: 12,
      gap:8,
    },
    logoutText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginVertical: 15,
      marginLeft: 3
    },
  });
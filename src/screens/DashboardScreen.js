
import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, realTimeDatabase, db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,    
 } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Progress from 'react-native-progress';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


export default function DashboardScreen() {
    const navigation = useNavigation();
    const authUser = auth.currentUser;
    const [userData, setUserData] = useState(null)
    const [moisture, setMoisture] = useState(null);
    const [humidity, setHumidity] = useState(null);
    const [celsius, setCelsius] = useState(null);
    const [fahrenheit, setFahrenheit] = useState(null);
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const animation = useRef(null);
    const notificationListener = useRef();
    const responseListener = useRef();

    const fetchUserData = async () => {
        try {
          if (authUser) {
            const userDocRef = doc(db, 'users', authUser.uid);
            const userDocSnapshot = await getDoc(userDocRef);
      
            if (userDocSnapshot.exists()) {
              const userData = userDocSnapshot.data();
              setUserData(userData);
            } else {
              console.log('User document does not exist');
            }
          } else {
            console.log('User is not authenticated');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
    };

    const fetchMoisture = useCallback(() => {
        const dataRef = ref(realTimeDatabase, '/plant/soilMoisture');

        const moistureListener = onValue(dataRef, (snapshot) => {
        const newMoisture = snapshot.val();
        if (newMoisture !== null) {
            setMoisture(newMoisture);
        }
        });

        return () => {
            moistureListener(); 
        };
    }, []);

    const fetchHumidity = useCallback(() => {
        const dataRef = ref(realTimeDatabase, '/plant/humidity');

        const humidityListener = onValue(dataRef, (snapshot) => {
        const newHumidity = snapshot.val();
        if (newHumidity !== null) {
            setHumidity(newHumidity);
        }
        });

        return () => {
            humidityListener(); 
        };
    }, []);

    const fetchCelsius = useCallback(() => {
        const dataRef = ref(realTimeDatabase, '/plant/celsius');

        const celsiusListener = onValue(dataRef, (snapshot) => {
        const newCelsius = snapshot.val();
        if (newCelsius !== null) {
            setCelsius(newCelsius);
        }
        });

        return () => {
            celsiusListener(); 
        };
    }, []);

    const fetchFahrenheit = useCallback(() => {
        const dataRef = ref(realTimeDatabase, '/plant/fahrenheit');

        const fahrenheitListener = onValue(dataRef, (snapshot) => {
        const newFahrenheit = snapshot.val();
        if (newFahrenheit !== null) {
            setFahrenheit(newFahrenheit);
        }
        });

        return () => {
            fahrenheitListener(); 
        };
    }, []);

    useEffect(() => {
        const cleanupMoistureFunction = fetchMoisture();
        const cleanupHumidityFunction = fetchHumidity();
        const cleanupCelsiusFunction = fetchCelsius();
        const cleanupFahrenheitFunction = fetchFahrenheit();

        return () => {
            cleanupMoistureFunction();
            cleanupHumidityFunction();
            cleanupCelsiusFunction();
            cleanupFahrenheitFunction();
        };
    }, [fetchMoisture, fetchHumidity, fetchCelsius, fetchFahrenheit]);

     

    useEffect(() => {
      registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
  
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });
  
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });
  
      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }, []);

    useEffect(() => {
      fetchUserData();
    }, [userData]);

    useEffect(() => {
      if (moisture !== null && moisture < 40) {
          schedulePushNotification(moisture, authUser);
      }
    }, []);

    useEffect(() => {
      const playAnimationWithDelay = () => {
        setTimeout(() => {
          animation.current.reset();
          animation.current.play();
        }, 2000);
      };

      playAnimationWithDelay();
    }, []);


  const sensorData = [
    { id: '1', icon: 'water-outline', title: 'Humidity', value: `${humidity}%` },
    { id: '2', icon: 'thermometer-outline', title: 'Temperature', value: `${celsius}°C` },
    { id: '3', icon: 'sunny-outline', title: 'Light', value: `${fahrenheit}` },
  ];
  
  
  const renderItem = ({ item }) => (
    <View style={DashboardStyles.sensorDiv}>
      <Ionicons name={item.icon} size={25} color="#fff" />
      <View>
        <Text style={DashboardStyles.sensorTitle}>{item.title}</Text>
        <Text style={{ color: "#fff" }}>{item.value}</Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={DashboardStyles.container}>  

      <View style={DashboardStyles.header}>
        <View style={DashboardStyles.userInfo}>
          <TouchableOpacity onPress={() => navigation.push('Setting')}>
            <Image
              source={{uri: (userData && userData.profilePicture) || 'https://i.stack.imgur.com/l60Hf.png'}} 
              style={DashboardStyles.profileImage}
            />
          </TouchableOpacity>
          <Text style={DashboardStyles.userName}>
            {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
          </Text>
        </View>
        <TouchableOpacity style={DashboardStyles.notificationBtn} onPress={() => navigation.push('Notification')}>
          <Ionicons name="notifications-outline" size={25} color="#707070"/>
        </TouchableOpacity>
      </View>
           
      <View style={DashboardStyles.plantContainer}>
        <Progress.Circle
          progress={moisture !== null ? moisture / 100 : 0}
          color={moisture !== null && moisture < 40 ? 'red' : 'green'}
          size={250}
        />
        <LottieView
          ref={animation}
          style={{
            marginTop: -110,
            width: 200,
            height: 200,
          }}
          source={require('../../assets/plant-animation.json')}
        />
      </View>

      <View style={DashboardStyles.moistureDiv}>
        <View style={{flexDirection: 'row', gap: 8}}>                    
          <Ionicons name="leaf-outline" size={15} color="#fff"/>
          <Text style={{color: "#fff"}}>Soil Moisture</Text>
        </View>
        <Text style={DashboardStyles.moistureTxt}>{moisture}%</Text>
        <Text style={{color: "#fff"}}>{moisture !== null && moisture < 40 ? 'Water your plant' : 'The plant is doing well'}</Text>
        <View style={DashboardStyles.sensorGroup}>
          <FlatList
            data={sensorData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            horizontal={false} 
            contentContainerStyle={DashboardStyles.sensorGroup}
          />
        </View>
      </View>

    </SafeAreaView>
  );
};


  async function schedulePushNotification(moisture, authUser) {
    const firestoreRef = doc(db, 'notifications', `${authUser.uid}-${Date.now()}`);

    const notificationData = {
      title: "Your plant is thirsty! 🌱",
      moisture: moisture,
      timestamp: Date.now(),
    };

    try {
      await setDoc(firestoreRef, notificationData);
      console.log('Notification data pushed to Firestore successfully!');
    } catch (dbError) {
      console.error('Error pushing notification data to Firestore:', dbError);
    }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Your plant is thirsty! 🌱",
          body: 'Tap here to water your plant!',
        },
        trigger: { seconds: 10 },
      });
    }
  
  
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
      token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }

const DashboardStyles = StyleSheet.create({
    container: {
        flex:1,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 60,
        shadowColor: '#191919',
        shadowRadius: 2
    },
    notificationBtn: {
        width: 35,
        height: 35,
        borderRadius: 60,
        borderColor: '#707070',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    plantContainer: {
      justifyContent:'center',
      alignItems: 'center',
    },
    moistureDiv: {
      padding: 20,
      borderTopLeftRadius:20,
      borderTopRightRadius:20,
      alignItems: 'center',
      backgroundColor: '#09814A',
    },
    moistureTxt: {
        fontSize: 32,
        textAlign: 'center',
        color: '#fff'
    },
    sensorGroup: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sensorDiv: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: 5,
        flexDirection: 'row',
        padding: 12,
        gap: 12,
    },
    sensorTitle: {
        fontWeight: 'bold',
        color: '#fff'
    },
    waterBtn: {
        width: 60,
        height: 60,
        backgroundColor: '#fff',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
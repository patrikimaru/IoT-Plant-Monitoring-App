import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { 
  Text,
  FlatList,
  View, 
  TouchableOpacity,
  StyleSheet
} from 'react-native';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsCollection = collection(db, 'notifications');
        const querySnapshot = await getDocs(notificationsCollection);

        const notificationsData = [];
        querySnapshot.forEach((doc) => {
          notificationsData.push({ id: doc.id, ...doc.data() });
        });

        setNotifications(notificationsData.reverse());
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const formatTimestamp = (timestamp) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(timestamp).toLocaleString('en-US', options);
  };

  return (
    <SafeAreaView style={NotificationStyles.container}>
      <View style={NotificationStyles.header}>
        <TouchableOpacity style={NotificationStyles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={30} />
        </TouchableOpacity>
        <Text style={NotificationStyles.title}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={NotificationStyles.notificationItem}>
            <Text style={NotificationStyles.notificationTitle}>{item.title}</Text>
            <Text>Soil Moisture: {item.moisture}%</Text>
            <Text style={NotificationStyles.datetime}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const NotificationStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    gap: 12
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
    paddingBottom: 8,
    marginHorizontal: 20
  },
  datetime: {
    alignSelf: 'flex-end',
    fontSize: 12,
    fontWeight: '300'
  }
});


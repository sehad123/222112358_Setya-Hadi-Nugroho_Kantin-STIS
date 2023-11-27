/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable,
  Image,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import img from '../../../images/User.png';
import Header from '../../common/Header';

const Profile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Ambil informasi user berdasarkan userId dari login
    const fetchUserData = async () => {
      const userId = await AsyncStorage.getItem('USERID');
      try {
        const user = await firestore().collection('users').doc(userId).get();
        if (user.exists) {
          setUserData(user.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'Profile Saya '} />
      <View style={styles.content}>
        <Pressable style={styles.profileImageContainer}>
          <Image style={styles.profileImage} source={img} />
        </Pressable>
        {userData && (
          <React.Fragment>
            <Text style={styles.welcomeText}>
              Selamat Datang {userData.name}
            </Text>
            <Text style={styles.userInfo}>Email: {userData.email}</Text>
            <Text style={styles.userInfo}>Nomor HP: {userData.mobile}</Text>
          </React.Fragment>
        )}
        <Pressable
          onPress={() => navigation.navigate('SelectLogin')}
          style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Ganti dengan warna latar belakang yang diinginkan
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginVertical: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 80,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  userInfo: {
    fontSize: 16,
    marginVertical: 5,
  },
  signOutButton: {
    padding: 7,
    backgroundColor: 'orange',
    borderRadius: 10,
    marginTop: 20,
  },
  signOutText: {
    color: 'white',
  },
});

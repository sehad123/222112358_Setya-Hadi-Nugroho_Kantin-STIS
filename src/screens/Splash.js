/* eslint-disable prettier/prettier */
import {View, Text, StyleSheet, Image} from 'react-native';
import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = ({navigation}) => {
  useEffect(() => {
    setTimeout(() => {
      checkLogin();
    }, 3000);
  }, []);
  const checkLogin = async () => {
    const email = await AsyncStorage.getItem('EMAIL');
    console.log(email);
    if (email !== null) {
      navigation.navigate('Home');
    } else {
      navigation.navigate('Biometric');
    }
  };
  return (
    <View style={styles.container}>
      <View>
        <Image
          style={{height: 90, width: 90, marginBottom: 10}}
          source={require('../images/stis.png')}
        />
      </View>
      <Text style={styles.logo}>Kantin STIS</Text>
    </View>
  );
};

export default Splash;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 30,
    fontWeight: '800',
    color: 'red',
  },
});

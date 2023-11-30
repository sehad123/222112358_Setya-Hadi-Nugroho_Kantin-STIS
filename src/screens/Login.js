/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from './common/Loader';

const backgroundImage = require('../images/blury_background.jpg'); // Ganti dengan path gambar Anda

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const adminLogin = async () => {
    setModalVisible(true);
    const users = await firestore().collection('admin').get();
    setModalVisible(false);

    if (
      email === users.docs[0]._data.email &&
      password === users.docs[0]._data.password
    ) {
      await AsyncStorage.setItem('EMAIL', email);
      navigation.navigate('Dashboard');
    } else {
      alert('Email / Password anda salah');
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Image
          style={{height: 90, width: 90, marginBottom: 10}}
          source={require('../images/stis.png')}
        />
        <Text style={styles.title}>Admin Login</Text>
        <TextInput
          style={styles.inputStyle}
          placeholder={'Enter Email Id'}
          value={email}
          onChangeText={txt => setEmail(txt)}
        />
        <TextInput
          style={styles.inputStyle}
          placeholder={'Enter Password '}
          value={password}
          secureTextEntry
          onChangeText={txt => setPassword(txt)}
        />
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => {
            if (email !== '' && password !== '') {
              adminLogin();
            } else {
              alert('Mohon isi semua data');
            }
          }}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>
        <Loader modalVisible={modalVisible} setModalVisible={setModalVisible} />
      </View>
    </ImageBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    alignSelf: 'center',
  },
  inputStyle: {
    paddingLeft: 20,
    height: 50,
    marginTop: 30,
    borderWidth: 0.5,
    borderRadius: 10,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  loginBtn: {
    backgroundColor: 'skyblue',
    width: '90%',
    height: 50,
    borderRadius: 10,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
});

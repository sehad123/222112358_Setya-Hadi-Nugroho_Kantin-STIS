/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import Loader from '../common/Loader';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';

const UserSignup = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [imageData, setImageData] = useState(null);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [saldo, setSaldo] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfilImage] = useState('');
  const nav = useNavigation();

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
        openGallery();
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (!result.didCancel) {
      console.log(result);
      setImageData(result);
    }
  };

  const uploadImage = async () => {
    if (imageData && imageData.assets) {
      const reference = storage().ref(imageData.assets[0].fileName);
      const pathToFile = imageData.assets[0].uri;

      try {
        await reference.putFile(pathToFile);
        const url = await storage()
          .ref(imageData.assets[0].fileName)
          .getDownloadURL();
        console.log(url);
        saveUser(url);
      } catch (error) {
        console.error('Error uploading image: ', error);
      }
    } else {
      saveUser(''); // Jika tidak ada gambar yang diunggah, kirim string kosong sebagai URL gambar
      // nav.navigate('UserLogin');
    }
  };

  // ...
  const saveUser = async url => {
    setModalVisible(true);

    try {
      const userRef = firestore().collection('users');
      const existingUser = await userRef.where('email', '==', email).get();

      if (!existingUser.empty) {
        setModalVisible(false);
        alert('Email sudah terdaftar!');
        return;
      }

      const userId = uuid.v4();
      const imageUrl = url || '';

      await userRef.doc(userId).set({
        name: name,
        email: email,
        password: password,
        mobile: mobile,
        saldo: saldo,
        userId: userId,
        profileImage: imageUrl,
        cart: [],
      });

      setModalVisible(false);
      navigation.goBack();
      alert('Registrasi berhasil silahkan login');
    } catch (error) {
      setModalVisible(false);
      console.log(error);
    }
  };
  // ...
  const isValidEmail = input => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@gmail\.com\b/;
    return emailRegex.test(input);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      {imageData !== null ? (
        <Image
          source={{uri: imageData.assets[0].uri}}
          style={styles.imageStyle}
        />
      ) : null}

      <TextInput
        style={styles.inputStyle}
        placeholder={'Nama'}
        value={name}
        onChangeText={txt => setName(txt)}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder={'Email '}
        value={email}
        onChangeText={txt => setEmail(txt)}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder={'No Hp'}
        keyboardType={'number-pad'}
        value={mobile}
        onChangeText={txt => setMobile(txt)}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder={'Saldo Awal'}
        keyboardType={'number-pad'}
        value={saldo}
        onChangeText={txt => setSaldo(txt)}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder={'Password '}
        value={password}
        secureTextEntry
        onChangeText={txt => setPassword(txt)}
      />

      <Text style={{textAlign: 'center', color: 'black', marginTop: 20}}>
        URL Gambar
      </Text>
      <TextInput
        placeholder="Masukkan URL Gambar"
        style={styles.inputStyle}
        value={profileImage}
        onChangeText={text => setProfilImage(text)}
      />

      <Text style={{alignSelf: 'center', marginTop: 20}}>OR</Text>

      <TouchableOpacity
        style={styles.pickBtn}
        onPress={requestCameraPermission}>
        <Text style={{textAlign: 'center', color: 'black'}}>
          Ambil dari Galeri
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => {
          if (
            email === '' &&
            password === '' &&
            name === '' &&
            mobile === '' &&
            saldo === ''
          )
            alert('mohon lengkapi semua data');
          else if (mobile.length < 11)
            alert('nomor telpon minimal 11 karakter');
          else if (password.length < 8) alert('Password minimal 8 karakter');
          else if (!isValidEmail(email)) alert('Email anda tidak valid');
          else uploadImage();
        }}>
        <Text style={styles.btnText}>Sign up</Text>
      </TouchableOpacity>
      <Loader modalVisible={modalVisible} setModalVisible={setModalVisible} />
    </ScrollView>
  );
};

export default UserSignup;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  pickBtn: {
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  imageStyle: {
    width: '90%',
    height: 250,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
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
    alignSelf: 'center',
    marginTop: 30,
    borderWidth: 0.5,
    borderRadius: 10,
    width: '90%',
  },
  loginBtn: {
    backgroundColor: 'orange',
    width: '90%',
    height: 50,
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});

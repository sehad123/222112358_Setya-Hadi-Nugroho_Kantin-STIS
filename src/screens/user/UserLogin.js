/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../common/Loader';
import {translation} from '../../Utils';

const UserLogin = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [forgetPasswordModal, setForgetPasswordModal] = useState(false);
  const [newPasswordModal, setNewPasswordModal] = useState(false);
  const [isEmailFilled, setIsEmailFilled] = useState(false);
  const [isNewPasswordFilled, setIsNewPasswordFilled] = useState(false);

  useEffect(() => {
    getLang();
  }, []);

  // Fungsi untuk memeriksa apakah email terdaftar di Firebase
  const checkEmailInFirebase = async () => {
    setForgetPasswordModal(true);
    try {
      if (email.length === 0) {
        alert('Masukkan email anda');
      } else {
        const userSnapshot = await firestore()
          .collection('users')
          .where('email', '==', email)
          .get();

        if (userSnapshot.empty) {
          alert('Email tidak terdaftar');
          return;
        } else {
          setForgetPasswordModal(false);
          setNewPasswordModal(true);
        }
      }
    } catch (error) {
      console.log(error);
      alert('Error checking email');
    }
  };

  // Fungsi untuk memperbarui password di Firebase
  const updatePassword = async () => {
    try {
      if (newPassword.trim() === '') {
        alert('Password tidak boleh kosong');
        return;
      } else if (newPassword.length < 8) {
        alert('password minimal harus 8 karakter');
        return;
      } else {
        const userId = await AsyncStorage.getItem('USERID');
        await firestore()
          .collection('users')
          .doc(userId) // Ganti 'documentId' dengan ID dokumen pengguna dari Firebase
          .update({
            password: newPassword,
          });

        setNewPasswordModal(false);
        alert('silahkan Login dengan password baru anda');
      }
    } catch (error) {
      console.log(error);
      alert('Error updating password');
    }
  };

  const getLang = async () => {
    console.log(await AsyncStorage.getItem('LANG'));
    setSelectedLang(parseInt(await AsyncStorage.getItem('LANG')));
  };
  const adminLogin = async () => {
    setModalVisible(true);
    try {
      const userSnapshot = await firestore()
        .collection('users')
        .where('email', '==', email)
        .where('password', '==', password)
        .get();

      setModalVisible(false);

      if (userSnapshot.empty) {
        alert('Email / Password anda salah');
        return;
      }

      const userData = userSnapshot.docs[0].data();
      goToNextScreen(
        userData.userId,
        userData.mobile,
        userData.name,
        userData.saldo,
        userData.profileImage,
      );
    } catch (error) {
      setModalVisible(false);
      console.log(error);
      alert('Please Check Email/Password');
    }
  };

  const goToNextScreen = async (userId, mobile, name) => {
    await AsyncStorage.setItem('EMAIL', email);
    await AsyncStorage.setItem('USERID', userId);
    await AsyncStorage.setItem('MOBILE', mobile);
    await AsyncStorage.setItem('NAME', name);
    navigation.navigate('Home');
  };
  return (
    <View style={styles.container}>
      <Image
        style={{height: 90, width: 90, marginBottom: -80, alignSelf: 'center'}}
        source={require('../../images/stis.png')}
      />
      <Text style={styles.title}>
        {selectedLang == 0
          ? translation[1].English
          : selectedLang == 1
          ? translation[1].Jawa
          : selectedLang == 2
          ? translation[1].Indonesia
          : selectedLang == 3
          ? translation[1].Punjabi
          : selectedLang == 4
          ? translation[1].arab
          : null}
      </Text>
      <TextInput
        style={styles.inputStyle}
        placeholder={'Enter Email '}
        // value={email}
        onChangeText={txt => setEmail(txt)}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder={'Enter Password '}
        value={password}
        secureTextEntry
        onChangeText={txt => setPassword(txt)}
      />
      <Text
        style={{
          color: 'blue',
          textAlign: 'right',
          marginRight: 25,
          fontSize: 16,
          marginTop: 5,
          fontWeight: '600',
        }}
        onPress={() => setForgetPasswordModal(true)}>
        Forget Password ?
      </Text>
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => {
          if (email !== '' && password !== '') {
            adminLogin();
          } else {
            alert('Please Enter Data');
          }
        }}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>
      <Text
        style={styles.createNewAccount}
        onPress={() => {
          navigation.navigate('UserSignup');
        }}>
        <Text style={{color: 'black'}}>Don't Have Account ? </Text>
        <Text style={{color: 'blue'}}> Register</Text>
      </Text>

      <Loader modalVisible={modalVisible} setModalVisible={setModalVisible} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={forgetPasswordModal}
        onRequestClose={() => {
          setForgetPasswordModal(!forgetPasswordModal);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Masukkan Email Anda</Text>
            <TextInput
              style={styles.input}
              onChangeText={text => {
                setEmail(text);
                setIsEmailFilled(text.trim().length > 0);
              }}
              // value={email}
            />
            <Pressable
              style={[
                styles.button,
                styles.buttonClose,
                {opacity: isEmailFilled ? 1 : 0.5},
              ]}
              onPress={checkEmailInFirebase}
              disabled={!isEmailFilled}>
              <Text style={styles.textStyle}>Submit </Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.buttonClose,
                {position: 'absolute', top: 0, right: 0},
              ]}
              onPress={() => setForgetPasswordModal(!forgetPasswordModal)}>
              <Image
                source={require('../../images/close.png')}
                style={{
                  width: 20,
                  height: 20,
                  position: 'absolute',
                  top: 0,
                  right: 0,
                }}
              />
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={newPasswordModal}
        onRequestClose={() => {
          setNewPasswordModal(!newPasswordModal);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Masukkan password baru anda</Text>
            <TextInput
              style={styles.input}
              onChangeText={text => {
                setNewPassword(text);
                setIsNewPasswordFilled(text.trim().length > 0);
              }}
              // value={newPassword}
              secureTextEntry
            />
            <Pressable
              style={[
                styles.button,
                styles.buttonClose,
                {opacity: isNewPasswordFilled ? 1 : 0.5},
              ]}
              onPress={updatePassword}
              disabled={!isNewPasswordFilled}>
              <Text style={styles.textStyle}>Submit </Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.buttonClose,
                {position: 'absolute', top: 0, right: 0},
              ]}
              onPress={() => setNewPasswordModal(!newPasswordModal)}>
              <Image
                source={require('../../images/close.png')}
                style={{
                  width: 20,
                  height: 20,
                  position: 'absolute',
                  top: 0,
                  right: 0,
                }}
              />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserLogin;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginVertical: 5,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginTop: 100,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: 'orange',
    width: '90%',
    height: 50,
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    width: 200,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  createNewAccount: {
    fontSize: 18,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 50,
    alignSelf: 'center',
  },
});

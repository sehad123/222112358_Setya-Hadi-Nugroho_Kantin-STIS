/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable,
  Image,
  View,
  PermissionsAndroid,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import img from '../../../images/User.png';
import {launchImageLibrary} from 'react-native-image-picker';
import Header from '../../common/Header';
import storage from '@react-native-firebase/storage';

const Profile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [refreshPage, setRefreshPage] = useState(false);
  const [uploaded, setUploaded] = useState(false); // State untuk menandai apakah gambar sudah diunggah atau belum
  const [modalVisible, setModalVisible] = useState(false); // State untuk menampilkan atau menyembunyikan modal
  const [saldoToAdd, setSaldoToAdd] = useState(''); // State untuk menampung jumlah saldo yang akan ditambahkan

  const deleteImage = async () => {
    try {
      const userId = await AsyncStorage.getItem('USERID');
      const userRef = firestore().collection('users').doc(userId);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        await userRef.update({
          profileImage: '',
        });

        setModalVisible(false);
        setRefreshPage(prev => !prev);
        setUploaded(true);
      }
    } catch (error) {
      console.error('Error delete image:', error);
    }
  };
  const topUpSaldo = async () => {
    if (saldoToAdd === '') {
      alert('Mohon masukkan jumlah saldo yang ingin ditambahkan.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('USERID');
      const userRef = firestore().collection('users').doc(userId);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const currentSaldo = userSnapshot.data().saldo || 0;
        const newSaldo = parseInt(saldoToAdd) + currentSaldo;

        await userRef.update({
          saldo: newSaldo,
        });

        setModalVisible(false);
        setSaldoToAdd('');
        setRefreshPage(prev => !prev);
        setUploaded(true);
      }
    } catch (error) {
      console.error('Error topping up saldo:', error);
    }
  };
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
    if (!imageData) {
      console.warn('No image selected');
      return;
    }

    try {
      const fileName = imageData.assets[0].fileName;
      const reference = storage().ref(`profile_images/${fileName}`);
      const path = imageData.assets[0].uri;

      await reference.putFile(path);

      const url = await reference.getDownloadURL();

      // Update user data with the new image URL
      const updatedUserData = {
        ...userData,
        profileImage: url,
      };

      setImageData({
        ...imageData,
        uploadedImageUrl: url,
      });

      const userId = await AsyncStorage.getItem('USERID');

      // Update user data in Firestore
      await firestore().collection('users').doc(userId).update({
        profileImage: url,
      });

      // Render the component with the updated user data
      setUserData(updatedUserData);
      // Set state to trigger page refresh
      setRefreshPage(prev => !prev);
      setUploaded(true); // Setelah berhasil upload, tandai bahwa gambar sudah diunggah
    } catch (error) {
      console.error(error);
    }
  };

  const onUploadImage = () => {
    // Memanggil fungsi uploadImage() setelah gambar dipilih
    uploadImage();
  };
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
  }, [refreshPage]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'Profile Saya '} />
      <View style={styles.content}>
        <View style={styles.profileImageContainer}>
          <Image
            style={styles.profileImage}
            source={
              userData && userData.profileImage
                ? {uri: userData.profileImage}
                : img
            }
          />
          {userData && userData.profileImage ? (
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                padding: 5,
                backgroundColor: '#fff',
                borderRadius: 20,
              }}
              onPress={() => {
                Alert.alert(
                  'Konfirmasi',
                  'Apakah Anda yakin ingin menghapus profil?',
                  [
                    {
                      text: 'Batal',
                      onPress: () => console.log('Canceled'),
                      style: 'cancel',
                    },
                    {
                      text: 'Hapus',
                      onPress: () => deleteImage(), // Panggil fungsi deleteImage saat tombol "Hapus" ditekan
                      style: 'destructive',
                    },
                  ],
                  {cancelable: true},
                );
              }}>
              <Image
                source={require('../../../images/delete.png')} // Jika ada gambar terupload, gunakan delete.png
                style={{width: 20, height: 20}}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{position: 'absolute', right: 10, top: 20}}
              onPress={requestCameraPermission}>
              <Image
                source={require('../../../images/plus.png')} // Jika belum ada gambar, gunakan plus.png
                style={{width: 20, height: 20}}
              />
            </TouchableOpacity>
          )}
        </View>

        {userData && (
          <React.Fragment>
            <Text style={styles.welcomeText}>
              Selamat Datang {userData.name}
            </Text>
            <Text style={styles.userInfo}>Email: {userData.email}</Text>
            <Text style={styles.userInfo}>Nomor HP: {userData.mobile}</Text>
            <Text style={styles.userInfo}>Saldo: {userData.saldo}</Text>
          </React.Fragment>
        )}

        {imageData &&
          !uploaded && ( // Tampilkan tombol "Upload Image" hanya jika ada gambar yang dipilih
            <Pressable onPress={onUploadImage} style={styles.uploadButton}>
              <Text style={styles.uploadText}>Upload Image</Text>
            </Pressable>
          )}

        <View style={{flexDirection: 'row'}}>
          <Pressable
            onPress={() => navigation.navigate('SelectLogin')}
            style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
          <Pressable
            style={styles.saldoButton}
            onPress={() => setModalVisible(true)}>
            {/* Ketika tombol "Top Up Saldo" ditekan, setModalVisible(true) untuk menampilkan modal */}
            <Text style={styles.signOutText}>Top Up Saldo</Text>
          </Pressable>
        </View>

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Masukkan jumlah saldo yang ingin ditambahkan:
              </Text>
              <TextInput
                style={styles.input}
                onChangeText={text => setSaldoToAdd(text)}
                value={saldoToAdd}
                keyboardType="numeric"
              />
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={topUpSaldo}>
                <Text style={styles.textStyle}>Tambah Saldo</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.buttonClose,
                  {position: 'absolute', top: 0, right: 0},
                ]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Image
                  source={require('../../../images/close.png')}
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
    position: 'relative',
  },
  profileImageContainer: {
    marginVertical: 10,
  },
  uploadButton: {
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 10,
    marginTop: 20,
  },
  uploadText: {
    color: 'white',
    textAlign: 'center',
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
  saldoButton: {
    padding: 7,
    backgroundColor: 'blue',
    borderRadius: 10,
    marginTop: 20,
    marginLeft: 20,
  },
  signOutText: {
    color: 'white',
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
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginVertical: 5,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    width: 200,
  },
});

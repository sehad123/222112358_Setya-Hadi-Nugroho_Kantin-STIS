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
import Loader from '../../common/Loader';

const Profile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [refreshPage, setRefreshPage] = useState(false);
  const [uploaded, setUploaded] = useState(false); // State untuk menandai apakah gambar sudah diunggah atau belum
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // State untuk menampilkan atau menyembunyikan modal
  const [modalVisibleP, setModalVisibleP] = useState(false); // State untuk menampilkan atau menyembunyikan modal
  const [modalVisibleU, setModalVisibleU] = useState(false); // State untuk menampilkan atau menyembunyikan modal
  const [modalVisibleS, setModalVisibleS] = useState(false); // State untuk menampilkan atau menyembunyikan modal
  const [saldoToAdd, setSaldoToAdd] = useState(''); // State untuk menampung jumlah saldo yang akan ditambahkan
  const [Password, setPassword] = useState(''); // State untuk menampung jumlah saldo yang akan ditambahkan
  const [newPassword, setNewPassword] = useState(''); // State untuk menampung jumlah saldo yang akan ditambahkan

  const deleteImage = async () => {
    setModalVisible2(true);
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
        setModalVisible2(false);
      }
    } catch (error) {
      console.error('Error delete image:', error);
    }
  };
  const topUpSaldo = async () => {
    if (saldoToAdd === '') {
      alert('Mohon masukkan jumlah saldo yang ingin ditambahkan.');
      return;
    } else if (saldoToAdd < 10000) {
      alert('Minimum Top Up 10 Ribu ');
      return;
    } else {
      try {
        setModalVisible2(true);
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
          setModalVisible2(false);
          alert('Top up berhasil silahkan cek saldo anda');
        }
      } catch (error) {
        console.error('Error topping up saldo:', error);
      }
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
    setModalVisible2(true);
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
      setModalVisible2(false);
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

  const ubahPassword = async () => {
    setModalVisibleP(false);
    if (newPassword === '') {
      alert('Password tidak boleh kosong');
      return;
    } else if (newPassword === Password) {
      alert('Password baru tidak boleh sama dengan password lama');
      return;
    } else {
      setModalVisible2(true);
      try {
        const userId = await AsyncStorage.getItem('USERID');
        const userRef = firestore().collection('users').doc(userId);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
          await userRef.update({
            password: newPassword,
          });

          setModalVisibleU(false);
          setSaldoToAdd('');
          setRefreshPage(prev => !prev);
          setUploaded(true);
          setModalVisible2(false);
          alert(' Password anda berhasil diperbarui ');
        }
      } catch (error) {
        console.error('Error topping up saldo:', error);
      }
    }
  };
  const signOut = async () => {
    try {
      // Menghapus email dari penyimpanan lokal
      await AsyncStorage.removeItem('EMAIL');

      // Melakukan navigasi kembali ke halaman SelectLogin
      navigation.navigate('SelectLogin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
                right: 5,
                top: 0,
                padding: 4,
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
              <Loader
                modalVisible={modalVisible2}
                setModalVisible={setModalVisible2}
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
            <Text style={styles.userInfo}>{userData.email}</Text>
            <Text style={styles.userInfo}>{userData.mobile}</Text>
          </React.Fragment>
        )}

        {imageData &&
          !uploaded && ( // Tampilkan tombol "Upload Image" hanya jika ada gambar yang dipilih
            <Pressable onPress={onUploadImage} style={styles.uploadButton}>
              <Text style={styles.uploadText}>Upload Image</Text>
              <Loader
                modalVisible={modalVisible2}
                setModalVisible={setModalVisible2}
              />
            </Pressable>
          )}

        {/* Modal top up */}
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

        {/* Modal password */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisibleP}
          onRequestClose={() => {
            setModalVisibleP(!modalVisibleP);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Masukkan Password anda</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => setPassword(text)}
                // value={Password}
                secureTextEntry
              />
              <Pressable
                onPress={() => {
                  if (Password === userData.password) {
                    setModalVisibleU(true);
                  } else {
                    alert(' Password anda salah');
                  }
                }}
                style={[styles.button, styles.buttonClose]}>
                <Text style={styles.textStyle}>Confirm</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.buttonClose,
                  {position: 'absolute', top: 0, right: 0},
                ]}
                onPress={() => setModalVisibleP(!modalVisibleP)}>
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
        {/* Modal ubah password */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisibleU}
          onRequestClose={() => {
            setModalVisibleU(!modalVisibleU);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Masukkan Password baru anda</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => setNewPassword(text)}
                // value={newPassword}
                secureTextEntry
              />
              <Pressable
                onPress={ubahPassword}
                style={[styles.button, styles.buttonClose]}>
                <Text style={styles.textStyle}> Ubah Password </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.buttonClose,
                  {position: 'absolute', top: 0, right: 0},
                ]}
                onPress={() => setModalVisibleU(!modalVisibleU)}>
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
        {/* Modal informasi saldo */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisibleS}
          onRequestClose={() => {
            setModalVisibleS(!modalVisibleS);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {userData && (
                <React.Fragment>
                  <Text style={styles.modalText}>Saldo anda saat ini</Text>
                  <Text style={styles.modalTextS}> Rp {userData.saldo}</Text>
                </React.Fragment>
              )}
              <Pressable
                style={[
                  styles.button,
                  styles.buttonClose,
                  {position: 'absolute', top: 0, right: 0},
                ]}
                onPress={() => setModalVisibleS(!modalVisibleS)}>
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
      <View style={styles.content2}>
        <View>
          <Pressable
            onPress={() => setModalVisibleP(true)}
            style={[styles.itemContainer, {borderBottomWidth: 1}]}>
            <Image
              source={require('../../../images/pass.png')}
              style={styles.icon}
            />
            <Text style={styles.itemText}>Ubah Password</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Orders')}
            style={[styles.itemContainer, {borderBottomWidth: 1}]}>
            <Image
              source={require('../../../images/check.png')}
              style={styles.icon}
            />
            <Text style={styles.itemText}>Riwayat Belanja</Text>
          </Pressable>

          <Pressable
            onPress={() => setModalVisibleS(true)}
            style={[styles.itemContainer, {borderBottomWidth: 1}]}>
            <Image
              source={require('../../../images/saldo.png')}
              style={styles.icon}
            />
            <Text style={styles.itemText}>Informasi Saldo</Text>
          </Pressable>

          {/* ... (kode yang lain) */}

          {/* <Text style={styles.userInfo}>Saldo: {userData.saldo}</Text> */}

          <Pressable
            style={[
              styles.itemContainer,
              {borderBottomWidth: 1, marginLeft: 20},
            ]}
            onPress={() => setModalVisible(true)}>
            {/* Ketika tombol "Top Up Saldo" ditekan, setModalVisible(true) untuk menampilkan modal */}
            <Image
              source={require('../../../images/topup.png')} // Jika belum ada gambar, gunakan plus.png
              style={styles.icon}
            />
            <Text style={styles.itemText}>Top Up Saldo</Text>
            <Loader
              modalVisible={modalVisible2}
              setModalVisible={setModalVisible2}
            />
          </Pressable>

          <Pressable
            style={[
              styles.itemContainer,
              {borderBottomWidth: 1, marginLeft: 20},
            ]}
            onPress={() => {
              Alert.alert(
                'Konfirmasi',
                'Apakah Anda yakin ingin keluar?',
                [
                  {
                    text: 'Batal',
                    onPress: () => console.log('Canceled'),
                    style: 'cancel',
                  },
                  {
                    text: 'Ya',
                    onPress: () => signOut(), // Panggil fungsi signOut dengan tanda kurung
                    style: 'destructive',
                  },
                ],
                {cancelable: true},
              );
            }}>
            <Image
              source={require('../../../images/logout.png')}
              style={styles.icon}
            />
            <Text style={styles.itemText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBDB', // Ganti dengan warna latar belakang yang diinginkan
  },

  content: {
    flex: 1,
    width: '70%',
    marginBottom: 20,
    borderRadius: 20,
    marginTop: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'relative',
  },
  content2: {
    flex: 2,
    width: '90%',
    borderRadius: 20,
    marginTop: 10,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignSelf: 'center',
    position: 'relative',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: 15,
    marginVertical: 3,
    borderBottomColor: 'grey', // Warna garis bawah
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 20,
  },
  itemText: {
    fontSize: 18,
    width: '80%',
    fontWeight: '700',
  },

  profileImageContainer: {
    marginVertical: 10,
  },
  uploadButton: {
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 10,
  },
  uploadText: {
    color: 'white',
    textAlign: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 80,
    marginTop: -10,
  },
  welcomeText: {
    marginTop: -5,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: '700',
  },
  modalTextS: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    color: 'green',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    width: 200,
  },
});

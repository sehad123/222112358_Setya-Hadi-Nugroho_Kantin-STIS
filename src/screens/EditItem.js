/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  Image,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {useRoute} from '@react-navigation/native';
import Loader from '../screens/common/Loader';

const EditItem = ({navigation}) => {
  const route = useRoute();
  const [imageData, setImageData] = useState({
    assets: [{uri: route.params.data.imageUrl}],
  });
  const [name, setName] = useState(route.params.data.name);
  const [rating, setRating] = useState(route.params.data.rating);
  const [price, setPrice] = useState(route.params.data.price);
  const [stock, setStock] = useState(route.params.data.stock);
  const [modalVisible, setModalVisible] = useState(false);
  const [discountPrice, setDiscountPrice] = useState(
    route.params.data.discountPrice,
  );
  const [description, setDescription] = useState(route.params.data.description);
  const [imageUrl, setImageUrl] = useState('');
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
    if (result.didCancel) {
    } else {
      console.log(result);
      setImageData(result);
    }
  };

  const uplaodImage = async () => {
    const reference = storage().ref(imageData.assets[0].fileName);
    const pathToFile = imageData.assets[0].uri;
    // uploads file
    await reference.putFile(pathToFile);
    const url = await storage()
      .ref(imageData.assets[0].fileName)
      .getDownloadURL();
    console.log(url);
    uploadItem(url);
  };

  const uploadItem = () => {
    setModalVisible(true);
    firestore()
      .collection('items')
      .doc(route.params.id)
      .update({
        name: name,
        rating: rating,
        price: price,
        stock: stock,
        discountPrice: discountPrice,
        description: description,
        imageUrl: route.params.data.imageUrl + '',
      })
      .then(() => {
        console.log('User added!');
        navigation.goBack();
        setModalVisible(false);
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Tambah Produk</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SelectLogin');
            }}>
            <Image
              source={require('../images/logout.png')}
              style={styles.logoutIcon}
            />
          </TouchableOpacity>
        </View>

        {imageData !== null ? (
          <Image
            source={{uri: imageData.assets[0].uri}}
            style={styles.imageStyle}
          />
        ) : null}

        <Text style={styles.label}>Nama Produk</Text>
        <TextInput
          placeholder="Masukkan Nama Produk"
          style={styles.inputStyle}
          value={name}
          onChangeText={text => setName(text)}
        />
        <Text style={styles.label}>Rating Produk</Text>
        <TextInput
          placeholder="Masukkan Rating Produk"
          style={styles.inputStyle}
          value={rating}
          onChangeText={text => setRating(text)}
        />

        <Text style={styles.label}>Harga</Text>
        <TextInput
          placeholder="Masukkan Harga"
          style={styles.inputStyle}
          value={price}
          onChangeText={text => setPrice(text)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Harga Promo</Text>
        <TextInput
          placeholder="Masukkan Harga Promo"
          style={styles.inputStyle}
          value={discountPrice}
          onChangeText={text => setDiscountPrice(text)}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Stock</Text>
        <TextInput
          placeholder="Masukkan Stock Produk"
          style={styles.inputStyle}
          value={stock}
          onChangeText={text => setStock(text)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Deskripsi</Text>
        <TextInput
          placeholder="Deskripsi"
          style={styles.inputStyle}
          value={description}
          onChangeText={text => setDescription(text)}
          multiline
        />

        <Text style={styles.label}>URL Gambar</Text>
        <TextInput
          placeholder="Masukkan URL Gambar"
          style={styles.inputStyle}
          value={imageUrl}
          onChangeText={text => setImageUrl(text)}
        />

        <Text style={{alignSelf: 'center', marginTop: 20}}>OR</Text>

        <TouchableOpacity
          style={styles.pickBtn}
          onPress={requestCameraPermission}>
          <Text>Ambil dari Galeri</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => {
            if (
              name !== '' &&
              price !== '' &&
              discountPrice !== '' &&
              description !== '' &&
              stock !== '' &&
              rating !== ''
            ) {
              uploadItem();
            } else {
              alert('Mohon isi semua data');
            }
          }}>
          <Text style={{color: '#fff'}}>Edit Product</Text>
        </TouchableOpacity>
        <Loader modalVisible={modalVisible} setModalVisible={setModalVisible} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#fff',
    elevation: 5,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'purple',
  },
  logoutIcon: {
    width: 40,
    height: 30,
  },
  label: {
    marginLeft: 20,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  inputStyle: {
    width: '90%',
    height: 50,
    borderRadius: 10,
    borderWidth: 0.5,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 5,
    alignSelf: 'center',
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
  uploadBtn: {
    backgroundColor: '#5246f2',
    width: '90%',
    height: 50,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 70,
  },
  imageStyle: {
    width: '90%',
    height: 250,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
});

export default EditItem;

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
import {useRoute, useNavigation} from '@react-navigation/native';
const EditItem = ({navigation}) => {
  const route = useRoute();
  const nav = useNavigation();
  const [imageData, setImageData] = useState({
    assets: [{uri: route.params.data.imageUrl}],
  });
  const [name, setName] = useState(route.params.data.name);
  const [rating, setRating] = useState(route.params.data.rating);
  const [price, setPrice] = useState(route.params.data.price);
  const [discountPrice, setDiscountPrice] = useState(
    route.params.data.discountPrice,
  );
  const [description, setDescription] = useState(route.params.data.description);
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 200,
            }}>
            <TouchableOpacity
              onPress={() => {
                nav.goBack();
              }}
              style={{marginRight: 10}}>
              <Image
                source={require('../images/back.png')}
                style={{width: 30, height: 30}}
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Detail Item</Text>
          </View>
        </View>

        {imageData !== null ? (
          <Image
            source={{uri: imageData.assets[0].uri}}
            style={styles.imageStyle}
          />
        ) : null}
        <Text style={styles.judul}>{name}</Text>

        <View
          style={{flexDirection: 'row', marginLeft: 10, alignItems: 'center'}}>
          {[...Array(5)].map((_, index) => (
            <Image
              key={index}
              source={require('../images/fullStar.png')}
              style={{width: 30, height: 30}}
            />
          ))}
          <Text style={{fontSize: 18, fontWeight: '700'}}>
            {rating} | 100Rb+ Terjual
          </Text>
        </View>
        {price > 20000 ? (
          <>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                marginLeft: 15,
                color: 'red',
              }}>
              Rp {discountPrice}
            </Text>
          </>
        ) : (
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              marginLeft: 15,
              color: 'red',
            }}>
            Rp {price}
          </Text>
        )}

        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            marginLeft: 15,
          }}>
          Deskripsi
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '500',
            marginLeft: 15,
          }}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae,
          illo! Quam ea eveniet porro laborum quas impedit maiores dolorem,
          veritatis sit iure sunt sed, ratione vel doloribus rem! Vero nostrum
          itaque alias soluta iste nulla laudantium similique doloribus dolorem
          vel dolore, voluptate cupiditate adipisci placeat incidunt laborum
          facere debitis fuga sapiente est. Saepe ut laboriosam non perspiciatis
          quibusdam molestias delectus eveniet qui beatae quod obcaecati eos,
          ratione facilis doloribus esse, corrupti placeat aperiam quo, magnam
          quisquam. Ab iste quis exercitationem officia quaerat commodi tenetur
          facilis rem repellat repellendus accusamus magnam, accusantium
          sapiente, eius minus culpa perferendis fuga itaque similique
          laboriosam!
        </Text>
      </View>
    </ScrollView>
  );
};

export default EditItem;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 40,
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    elevation: 5,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
  },
  judul: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
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
    height: 400,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 5,
  },
  penulis: {
    fontSize: 20,
    marginLeft: 10,
    marginBottom: 10,
    fontWeight: '700',
  },
});

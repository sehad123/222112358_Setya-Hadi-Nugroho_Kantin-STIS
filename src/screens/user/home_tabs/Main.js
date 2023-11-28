/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from '../../common/Header';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useNavigation} from '@react-navigation/native';
let userId = '';
const Main = () => {
  const [items, setItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [columns, setColumns] = useState(2); // State untuk jumlah kolom
  const [filteredItems, setFilteredItems] = useState([]); // Menyimpan data produk yang difilter
  const [searchText, setSearchText] = useState(''); // State untuk teks yang diinputkan pada pencarian

  useEffect(() => {
    // const subscriber =
    firestore()
      .collection('items')
      .get()
      .then(querySnapshot => {
        console.log('Total users: ', querySnapshot.size);
        let tempData = [];
        querySnapshot.forEach(documentSnapshot => {
          console.log(
            'User ID: ',
            documentSnapshot.id,
            documentSnapshot.data(),
          );
          tempData.push({
            id: documentSnapshot.id,
            data: documentSnapshot.data(),
          });
        });
        setItems(tempData);
      });
    // Stop listening for updates when no longer required
    // return () => subscriber();

    const unsubscribe = firestore()
      .collection('items')
      .onSnapshot(snapshot => {
        const updatedItems = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
        }));
        setItems(updatedItems);
      });

    return () => unsubscribe(); // Unsubscribe ketika komponen di-unmount
  }, []);

  useEffect(() => {
    getCartItems();
  }, [isFocused]);

  useEffect(() => {
    // Ketika nilai pencarian berubah, filter produk berdasarkan teks yang diinputkan
    const filtered = items.filter(item =>
      item.data.name.toLowerCase().includes(searchText.toLowerCase()),
    );
    setFilteredItems(filtered);
  }, [searchText, items]);

  // Fungsi untuk melakukan pencarian
  const handleSearch = text => {
    setSearchText(text);
  };

  const getCartItems = async () => {
    userId = await AsyncStorage.getItem('USERID');
    const user = await firestore().collection('users').doc(userId).get();
    setCartCount(user._data.cart.length);
  };
  const onAddToCart = async (item, index) => {
    const user = await firestore().collection('users').doc(userId).get();
    console.log(user.data().cart);

    let tempCart = user.data().cart || []; // Jika cart kosong, inisialisasi dengan array kosong

    let existingItem = tempCart.find(itm => itm.id === item.id);
    if (existingItem) {
      // Jika item sudah ada di cart, tambahkan jumlahnya
      if (item.data.stock > 0) {
        existingItem.data.qty = (existingItem.data.qty || 0) + 1;
        // Kurangi stok produk
        item.data.stock -= 1;

        // Update stok produk di Firestore
        await firestore().collection('items').doc(item.id).update({
          stock: item.data.stock,
        });
      } else {
        alert('Stock produk habis!');
        return;
      }
    } else {
      if (item.data.stock > 0) {
        // Jika item belum ada di cart, tambahkan ke cart dengan qty 1
        tempCart.push({
          id: item.id,
          data: {...item.data, qty: 1}, // Inisialisasi qty menjadi 1
        });
        // Kurangi stok produk
        item.data.stock -= 1;

        // Update stok produk di Firestore
        await firestore().collection('items').doc(item.id).update({
          stock: item.data.stock,
        });
      } else {
        alert('Stock produk habis!');
        return;
      }
    }

    // Update cart di Firestore
    await firestore().collection('users').doc(userId).update({
      cart: tempCart,
    });

    getCartItems(); // Refresh jumlah item di keranjang
  };

  return (
    <View style={styles.container}>
      <Header
        title={'Daftar Menu'}
        icon={require('../../../images/cart.png')}
        count={cartCount}
        onClickIcon={() => {
          navigation.navigate('Cart');
        }}
      />
      <View
        style={{
          margin: 5,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 0.8,
          borderColor: '#C0C0C0',
          borderRadius: 7,
        }}>
        <TextInput
          placeholder="Search for items or More"
          onChangeText={text => handleSearch(text)} // Memanggil fungsi handleSearch saat teks berubah
        />
        <Image
          style={{width: 40, marginTop: 5, height: 40, borderRadius: 20}}
          source={require('../../../images/search.png')}
        />
      </View>

      <FlatList
        data={filteredItems}
        key={columns} // Ganti key ketika jumlah kolom berubah
        numColumns={columns}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              style={styles.itemView}
              onPress={() => {
                navigation.navigate('Detail', {
                  data: item.data,
                  id: item.id,
                });
              }}>
              {/* Image */}
              <Image
                source={{uri: item.data.imageUrl}}
                style={styles.itemImage}
              />
              <View
                style={{
                  flexDirection: 'row',
                  marginLeft: 10,
                  marginTop: 25,
                  marginBottom: -20,
                  alignItems: 'center',
                }}>
                {[...Array(1)].map((_, index) => (
                  <Image
                    key={index}
                    source={require('../../../images/fullStar.png')}
                    style={{width: 15, height: 15, marginLeft: -20}}
                  />
                ))}
                <Text style={{fontSize: 13, fontWeight: '700'}}>
                  {item.data.rating} | 100Rb+ Terjual
                </Text>
              </View>
              {/* Details */}
              <View style={styles.itemDetails}>
                <Text style={styles.nameText}>{item.data.name}</Text>
                <Text style={[styles.nameText, {fontSize: 17}]}>
                  Stock : {item.data.stock}
                </Text>
                {/* <Text style={styles.descText}>{item.data.description}</Text> */}
                <View style={styles.priceView}>
                  <Text style={styles.priceText}>
                    {'Rp ' + item.data.discountPrice}
                  </Text>
                  <Text style={styles.discountText}>
                    {'Rp ' + item.data.price}
                  </Text>
                </View>
                {/* Add to cart button */}
                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => {
                    if (item.data.stock > 0) {
                      onAddToCart(item, index);
                    } else {
                      alert('Stock produk habis!');
                    }
                  }}>
                  <Text style={{color: '#fff'}}>Add To cart</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginBottom: 50,
  },
  itemView: {
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    flex: 1,
    margin: 5,
    height: 300,
  },

  itemImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    margin: 5,
    marginBottom: -20,
    resizeMode: 'cover',
  },

  itemDetails: {
    flex: 1,
    margin: 10,
    alignSelf: 'center',
    paddingVertical: 10,
  },

  nameText: {
    fontSize: 18,
    fontWeight: '700',
  },
  nameTextH: {
    fontSize: 18,
    fontWeight: '700',
  },
  descText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    color: 'green',
    fontWeight: '700',
  },
  discountText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'line-through',
    marginLeft: 5,
    color: 'gray',
  },
  addToCartBtn: {
    backgroundColor: 'green',
    padding: 8,
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5,
    alignItems: 'center',
  },
});

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import Loader from '../common/Loader';
//   import {StripeProvider} from '@stripe/stripe-react-native';

const Cart = ({navigation}) => {
  const isFocused = useIsFocused();
  const [cartList, setCartList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState('');
  const [items, setItems] = useState([]);

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

    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(snapshot => {
        const user = snapshot.data();
        setCartList(user && user.cart ? user.cart : []);
      });

    return () => unsubscribe(); // Unsubscribe ketika komponen di-unmount
  }, [userId]);

  useEffect(() => {
    getCartItems();
  }, [isFocused]);

  const getCartItems = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('USERID');
      setUserId(storedUserId);

      const user = await firestore()
        .collection('users')
        .doc(storedUserId)
        .get();
      setCartList(user.data().cart || []); // Perbarui cartList dengan data dari Firestore
    } catch (error) {
      console.error('Error fetching user ID:', error);
      // Handle error fetching user ID
    }
  };

  const addItem = async item => {
    const itemDocRef = firestore().collection('items').doc(item.id);
    const itemDoc = await itemDocRef.get();
    const itemData = itemDoc.data();

    if (itemData && itemData.stock !== 0) {
      const user = await firestore().collection('users').doc(userId).get();
      let tempCart = user.data().cart || [];
      const index = tempCart.findIndex(itm => itm.id === item.id);

      if (index !== -1) {
        tempCart[index].data.qty += 1;
        await firestore()
          .collection('users')
          .doc(userId)
          .update({cart: tempCart});

        // Kurangi stok item di Firestore secara realtime
        await itemDocRef.update({stock: itemData.stock - 1});
        getCartItems();
      }
    } else {
      alert('Stock produk habis!');
    }
  };

  const removeItem = async item => {
    const itemDocRef = firestore().collection('items').doc(item.id);
    const itemDoc = await itemDocRef.get();
    const itemData = itemDoc.data();

    if (itemData) {
      const user = await firestore().collection('users').doc(userId).get();
      let tempCart = user.data().cart || [];
      const index = tempCart.findIndex(itm => itm.id === item.id);

      if (index !== -1 && itemData.stock >= 0) {
        tempCart[index].data.qty -= 1;
        await firestore()
          .collection('users')
          .doc(userId)
          .update({cart: tempCart});

        // Tambahkan stok item di Firestore secara realtime saat item dihapus
        await itemDocRef.update({stock: itemData.stock + 1});
        getCartItems();
      }
    }
  };

  const deleteItem = async index => {
    const user = await firestore().collection('users').doc(userId).get();
    let tempCart = user.data().cart || [];
    const removedItem = tempCart[index];

    if (removedItem) {
      tempCart.splice(index, 1);
      await firestore()
        .collection('users')
        .doc(userId)
        .update({cart: tempCart});

      const itemDocRef = firestore().collection('items').doc(removedItem.id);
      const itemDoc = await itemDocRef.get();
      const itemData = itemDoc.data();

      // Tambahkan stok item di Firestore saat item dihapus dari keranjang
      if (itemData) {
        await itemDocRef.update({stock: itemData.stock + 1});
        getCartItems();
      }
    }
  };

  const getTotal = () => {
    let total = 0;
    cartList.map(item => {
      total = total + item.data.qty * item.data.discountPrice;
    });
    return total;
  };

  const checkoutHandler = async () => {
    setModalVisible(true);
    const userDoc = await firestore().collection('users').doc(userId).get();
    const user = userDoc.data();
    const totalBiaya = getTotal();

    if (user && user.saldo >= totalBiaya) {
      // Saldo mencukupi, lanjutkan ke halaman Checkout
      navigation.navigate('Checkout');
      setModalVisible(false);
    } else {
      // Saldo tidak mencukupi, tampilkan notifikasi dan navigasikan ke halaman Profile
      alert('Saldo anda kurang, silahkan top up dulu.');
      navigation.navigate('Profile');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartList}
        renderItem={({item, index}) => {
          return (
            <View style={styles.itemView}>
              <Image
                source={{uri: item.data.imageUrl}}
                style={styles.itemImage}
              />
              <View style={styles.nameView}>
                <Text style={styles.nameText}>{item.data.name}</Text>
                <Text style={styles.descText}>
                  Stock : {item.data.stock - item.data.qty + 1}
                </Text>
                <View style={styles.priceView}>
                  <Text style={styles.priceText}>
                    {'Rp ' + item.data.discountPrice}
                  </Text>
                  <Text style={styles.discountText}>
                    {'RP ' + item.data.price}
                  </Text>
                </View>
              </View>
              <View style={styles.addRemoveView}>
                <TouchableOpacity
                  style={[
                    styles.addToCartBtn,
                    {
                      width: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 15,
                      marginBottom: 20,
                    },
                  ]}
                  onPress={() => {
                    if (item.data.qty > 1) {
                      removeItem(item);
                    } else {
                      deleteItem(index);
                    }
                  }}>
                  <Text
                    style={{color: '#fff', fontSize: 20, fontWeight: '700'}}>
                    -
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '900',
                    marginRight: 10,
                    marginBottom: 20,
                  }}>
                  {item.data.qty}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.addToCartBtn,
                    {
                      width: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10,
                      marginBottom: 23,
                    },
                  ]}
                  onPress={() => {
                    addItem(item);
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 20,
                      fontWeight: '700',
                    }}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
      {cartList.length > 0 && (
        <View style={styles.checkoutView}>
          <Text style={{color: '#000', fontWeight: '600'}}>
            {'Total Items : ' +
              cartList.length +
              '\nTotal Biaya : Rp ' +
              getTotal()}
          </Text>
          <TouchableOpacity
            style={[
              styles.addToCartBtn,
              {
                width: 100,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
            onPress={checkoutHandler}>
            <Text style={{color: 'white', fontWeight: '800', fontSize: 16}}>
              Checkout
            </Text>
            <Loader
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Cart;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemView: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 10,
    borderRadius: 10,
    height: 100,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    margin: 5,
  },
  nameView: {
    width: '30%',
    margin: 10,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
  },
  descText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 18,
    color: 'green',
    fontWeight: '700',
  },
  discountText: {
    fontSize: 17,
    fontWeight: '600',
    textDecorationLine: 'line-through',
    marginLeft: 5,
  },
  addRemoveView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToCartBtn: {
    backgroundColor: 'orange',
    padding: 2,
    borderRadius: 40,
  },
  checkoutView: {
    width: '100%',
    height: 60,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
});

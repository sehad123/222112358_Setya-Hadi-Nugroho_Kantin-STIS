/* eslint-disable prettier/prettier */
import {View, Text, StyleSheet, FlatList, Image} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import Header from '../../common/Header'; // Pastikan Header sudah diimpor

const Orders = () => {
  const [orderList, setOrderList] = useState([]);

  const getOrders = async () => {
    try {
      const userId = await AsyncStorage.getItem('USERID');
      const user = await firestore().collection('users').doc(userId).get();

      if (user.exists && user.data() && user.data().orders) {
        setOrderList(user.data().orders);
      } else {
        setOrderList([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <View style={styles.container}>
      <Header title={'Daftar Pesanan Anda'} />
      <FlatList
        data={orderList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View style={styles.orderItem}>
            {item.items.map((subItem, subIndex) => (
              <View key={subIndex} style={styles.itemView}>
                <Image
                  source={{uri: subItem.data.imageUrl}}
                  style={styles.itemImage}
                />
                <View>
                  <Text style={styles.nameText}>{subItem.data.name}</Text>
                  <Text style={styles.nameText}>
                    {'Harga : ' +
                      subItem.data.discountPrice +
                      ', Qty: ' +
                      subItem.data.qty}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  orderItem: {
    width: '90%',
    borderRadius: 10,
    elevation: 5,
    alignSelf: 'center',
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  itemView: {
    margin: 10,
    width: '100%',
    flexDirection: 'row',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 20,
    marginTop: 5,
  },
});

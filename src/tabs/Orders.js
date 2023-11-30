/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Header from '../screens/common/Header';
import {useIsFocused, useNavigation} from '@react-navigation/native';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    getAllOrders();
  }, []);

  const getAllOrders = async () => {
    try {
      const querySnapshot = await firestore().collection('orders').get();
      const tempData = [];

      querySnapshot.forEach(documentSnapshot => {
        tempData.push({
          orderId: documentSnapshot.id,
          data: documentSnapshot.data().data,
          orderBy1: documentSnapshot.data().orderBy1,
        });
      });

      setOrders(tempData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const renderOrderItem = ({item}) => {
    if (!item || !item.data || !item.data.items) {
      return null; // Tidak ada item, kembalikan null atau tampilkan pesan kosong
    }

    return (
      <View style={styles.orderItem}>
        <Text style={styles.orderBy}>
          {` ${item.data.orderBy}   ||    `}
          {item.data.tanggal ? item.data.tanggal : 'Not available'}
        </Text>

        <FlatList
          data={item.data.items}
          keyExtractor={(subItem, index) => index.toString()}
          renderItem={({item: subItem}) => (
            <View style={styles.itemView}>
              <Image
                source={{uri: subItem.data.imageUrl}}
                style={styles.itemImage}
              />
              <View>
                <Text style={styles.nameText}>{subItem.data.name}</Text>
                <Text style={styles.nameText}>
                  {`Price: ${subItem.data.discountPrice}, Qty: ${subItem.data.qty}`}
                </Text>
              </View>
            </View>
          )}
        />
        <Text style={styles.orderTotal}>
          {`Total : Rp ${calculateOrderTotal(item.data.items)}`}
        </Text>
      </View>
    );
  };

  const calculateOrderTotal = items => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return 0; // Kembalikan 0 jika items kosong atau tidak ada
    }

    return items.reduce(
      (total, item) => total + item.data.discountPrice * item.data.qty,
      0,
    );
  };
  const calculateTotalOmset = () => {
    let totalOmset = 0;
    orders.forEach(order => {
      const orderItems = order.data.items;
      if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
        totalOmset += calculateOrderTotal(orderItems);
      }
    });
    return totalOmset;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Daftar Pesanan</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SelectLogin');
          }}>
          <Image
            source={require('../images/logout.png')}
            style={{width: 40, height: 30, marginRight: 20, marginTop: 20}}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => item.orderId}
        renderItem={renderOrderItem}
      />
      <Text style={styles.orderTotal}>
        {`Total Omset: Rp ${calculateTotalOmset()}`}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#fff',
    elevation: 5,
    paddingLeft: 20,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '700',
    color: 'purple',
  },
  orderItem: {
    width: '90%',
    borderRadius: 10,
    elevation: 5,
    alignSelf: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
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
  orderBy: {
    fontSize: 17,
    fontWeight: 'bold',
    marginVertical: 8,
    marginLeft: 20,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    color: 'green',
    marginLeft: 20,
  },
});

export default Orders;

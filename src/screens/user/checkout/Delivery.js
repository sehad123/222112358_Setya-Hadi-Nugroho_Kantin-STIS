/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  StatusBar,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
const Delivery = () => {
  const route = useRoute();
  const navigation = useNavigation();
  useEffect(() => {
    const handlePlaceOrder = async () => {
      try {
        if (route.params.status === 'success') {
          const userDoc = firestore()
            .collection('users')
            .doc(route.params.userId);
          const user = await userDoc.get();

          if (user.exists) {
            const existingOrders = user.data()?.orders || [];

            // Pastikan data tidak duplikat sebelum ditambahkan
            const isExistingOrder = existingOrders.some(order => {
              return order.orderId === route.params.paymentId; // Ganti dengan identifier yang sesuai
            });

            if (!isExistingOrder) {
              const newOrder = {
                items: route.params.cartList,
                address: route.params.address,
                orderBy: route.params.userName,
                userEmail: route.params.userEmail,
                userMobile: route.params.userMobile,
                userId: route.params.userId,
                orderTotal: route.params.total,
                paymentId: route.params.paymentId,
                tanggal: route.params.tanggal,
              };

              // Tambahkan data baru ke dalam array orders
              existingOrders.push(newOrder);

              // Update field orders di firestore dengan array yang sudah diperbarui
              await userDoc.update({
                orders: existingOrders, // Tambahkan pesanan baru ke dalam array orders
              });

              // Tambahkan order baru ke dalam collection orders
              await firestore()
                .collection('orders')
                .doc(route.params.paymentId)
                .set({
                  data: newOrder,
                  orderBy: route.params.userId,
                });

              // Set timeout untuk navigasi ke OrderStatus setelah 10 detik
              const timeout = setTimeout(() => {
                navigation.navigate('OrderStatus');
              }, 10000);

              return () => {
                // Hentikan timeout jika komponen di-unmount atau navigasi terjadi
                clearTimeout(timeout);
              };
            }
          }
        }
      } catch (error) {
        console.error('Error placing order:', error);
      }
    };

    handlePlaceOrder();
  }, [route.params.status]);
  // Tambahkan route.params.status sebagai dependensi useEffect

  //   useEffect(() => {}, []);
  return (
    <View style={{flex: 1}}>
      <Image
        style={{height: 590, width: 500}}
        source={require('../../../images/maps.jpeg')}
      />
      <View
        style={{
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          marginTop: -120,
          backgroundColor: '#FFF',
          position: 'relative',
        }}>
        <TouchableOpacity
          style={{position: 'absolute', right: 20, top: 10}}></TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'orange',
            paddingHorizontal: 20,
            paddingTop: 20,
          }}>
          <View>
            <Text style={{fontSize: 18, fontWeight: '600', color: '#444'}}>
              Perkiraan sampai
            </Text>
            <Text style={{fontSize: 28, fontWeight: 'bold', color: '#444'}}>
              5 - 10 Detik
            </Text>
            <Text style={{marginTop: 10, color: '#444', fontWeight: '600'}}>
              Pesanan anda sedang di jalan
            </Text>
          </View>
          <Image
            style={{height: 100, width: 100, borderRadius: 60}}
            source={require('../../../images/hadigojek.jpg')}
          />
        </View>

        <View
          style={{
            backgroundColor: `orange`,
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: 'orange',
              padding: 5,
              borderRadius: 30,
            }}>
            <Image
              style={{height: 60, width: 60, borderRadius: 30}}
              source={require('../../../images/hadigojek.jpg')}
            />
          </View>

          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#FFF'}}>
              Setya Hadi Nugroho
            </Text>
            <Text style={{color: '#FFF', fontWeight: '600', fontSize: 20}}>
              AB 1234 AB
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 10,
            }}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Maaf Driver anda Sedang dijalan');
              }}
              style={{backgroundColor: '#FFF', padding: 5, borderRadius: 20}}>
              <Image
                style={{height: 40, width: 40, borderRadius: 30}}
                source={require('../../../images/phone.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Pesanan yang sudah dipesan tidak bisa dibatalkan');
              }}
              style={{
                backgroundColor: '#FFF',
                padding: 5,
                borderRadius: 20,
                marginLeft: 10,
              }}>
              <Image
                style={{height: 40, width: 40, borderRadius: 30}}
                source={require('../../../images/close.png')}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Delivery;

/* eslint-disable prettier/prettier */
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React, {useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import LottieView from 'lottie-react-native';
const OrderStatus = ({navigation}) => {
  // const route = useRoute();
  // useEffect(() => {
  //   if (route.params.status == 'success') {
  //     placeOrder();
  //   }
  // }, []);
  // const placeOrder = async () => {
  //   let tempOrders = [];
  //   let user = await firestore()
  //     .collection('users')
  //     .doc(route.params.userId)
  //     .get();

  //   if (user.exists) {
  //     if (user._data && user._data.orders && Array.isArray(user._data.orders)) {
  //       tempOrders = user._data.orders;
  //     }
  //   }

  //   tempOrders.push({
  //     items: route.params.cartList,
  //     address: route.params.address,
  //     orderBy: route.params.userName,
  //     userEmail: route.params.userEmail,
  //     userMobile: route.params.userMobile,
  //     userId: route.params.userId,
  //     orderTotal: route.params.total,
  //     paymentId: route.params.paymentId,
  //   });

  //   await firestore().collection('users').doc(route.params.userId).update({
  //     cart: [],
  //     orders: tempOrders,
  //   });

  //   firestore().collection('orders').add({
  //     data: tempOrders,
  //     orderBy: route.params.userId,
  //     orderBy1: route.params.userId,
  //   });
  // };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../images/thumbs.json')}
        style={{
          height: 360,
          width: 300,
          alignSelf: 'center',
          marginTop: 300,
          justifyContent: 'center',
        }}
        autoPlay
        loop={true}
        speed={0.5}
      />
      <Text style={styles.msg}>
        {/* {route.params.status == 'success'
          ? 'Pesanan anda Sedang di Proses !!'
          : 'Pesanan anda Gagal !!'} */}
      </Text>
      <Text style={{color: 'black', fontSize: 20}}>
        Driver Anda Sudah Sampai
      </Text>
      <Text style={{color: 'black', fontSize: 20, marginTop: 10}}>
        Selamat Makan
      </Text>
      <TouchableOpacity
        style={styles.backToHome}
        onPress={() => {
          navigation.navigate('Home');
        }}>
        <Text style={{color: 'white', fontSize: 20}}>Go To Home</Text>
      </TouchableOpacity>

      <LottieView
        source={require('../../../images/sparkle.json')}
        style={{
          height: 360,
          width: 300,
          alignSelf: 'center',
          marginTop: 40,
          justifyContent: 'center',
        }}
        autoPlay
        loop={false}
        speed={0.7}
      />
    </View>
  );
};

export default OrderStatus;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '70%',
    height: '40%',
    alignSelf: 'center',
    marginBottom: 50,
  },
  msg: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: -50,
  },
  backToHome: {
    width: '50%',
    height: 50,
    borderWidth: 0.5,
    marginTop: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'orange',
  },
});

/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused} from '@react-navigation/native';
import Loader from '../../common/Loader';
let userId = '';
const Checkout = ({navigation}) => {
  const [cartList, setCartList] = useState([]);
  const isFocused = useIsFocused();
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState('No Selected Address');
  useEffect(() => {
    getCartItems();
    getAddressList();
  }, [isFocused]);
  const getCartItems = async () => {
    userId = await AsyncStorage.getItem('USERID');
    const user = await firestore().collection('users').doc(userId).get();
    setCartList(user._data.cart);
  };
  const getAddressList = async () => {
    const userId = await AsyncStorage.getItem('USERID');
    const addressId = await AsyncStorage.getItem('ADDRESS');
    const user = await firestore().collection('users').doc(userId).get();
    let tempDart = [];
    tempDart = user._data.address;
    tempDart.map(item => {
      if (item.addressId == addressId) {
        setSelectedAddress(
          ' Jalan : ' +
            item.street +
            '\n Kota / Kabupaten : ' +
            item.city +
            '\n Kode Pos : ' +
            item.pincode +
            '\n No HP :' +
            item.mobile,
        );
      }
    });
  };

  const getTotal = () => {
    let total = 0;
    cartList.map(item => {
      total = total + item.data.qty * item.data.discountPrice;
    });
    return total;
  };
  const payNow = async () => {
    const getFormattedDate = () => {
      const months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];

      const currentDate = new Date();
      const day = currentDate.getDate();
      const monthIndex = currentDate.getMonth();
      const year = currentDate.getFullYear();

      const formattedDate = `${day} ${months[monthIndex]} ${year}`;

      return formattedDate;
    };

    // Contoh penggunaan:
    const formattedToday = getFormattedDate();
    const generateUniqueId = () => {
      return Date.now().toString();
    };
    setModalVisible(true);
    try {
      const email = await AsyncStorage.getItem('EMAIL');
      const name = await AsyncStorage.getItem('NAME');
      const mobile = await AsyncStorage.getItem('MOBILE');

      const userDoc = await firestore().collection('users').doc(userId).get();
      const user = userDoc.data();
      const totalBiaya = getTotal();

      if (user && user.saldo >= totalBiaya) {
        // Simulate deduction of balance
        const newBalance = user.saldo - totalBiaya;

        // Update user's balance in Firestore
        await firestore()
          .collection('users')
          .doc(userId)
          .update({saldo: newBalance});
        setModalVisible(false);
        setTimeout(() => {
          navigation.navigate('Delivery', {
            status: 'success',
            paymentId: generateUniqueId(),
            cartList: cartList,
            total: getTotal(),
            address: selectedAddress,
            userId: userId,
            userName: name,
            userEmail: email,
            userMobile: mobile,
            tanggal: '10 Desember 2023',
          });
        }, 1000); // Simulating a 2-second payment process
      } else {
        alert('Saldo anda tidak mencukupi untuk melakukan pembayaran.');
        navigation.navigate('OrderStatus', {status: 'failed'});
      }
    } catch (error) {
      // handle failure
      console.error(error);

      navigation.navigate('OrderStatus', {
        status: 'failed',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View>
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
                  <Text style={styles.descText}>{item.data.description}</Text>
                  <View style={styles.priceView}>
                    <Text style={styles.priceText}>
                      {'Rp ' + item.data.discountPrice}
                    </Text>
                    <Text style={styles.discountText}>
                      {'Rp ' + item.data.price}
                    </Text>
                  </View>
                </View>
                <Text style={styles.nameText}>{'Qty : ' + item.data.qty}</Text>
              </View>
            );
          }}
        />
      </View>
      <View style={styles.totalView}>
        <Text style={styles.nameText}>Total</Text>
        <Text style={styles.nameText}>{'Rp ' + getTotal()}</Text>
      </View>
      <View style={styles.totalView}>
        <Text style={styles.nameText}>Selected Address</Text>
        <Text
          style={styles.editAddress}
          onPress={() => {
            navigation.navigate('Address');
          }}>
          Change Address
        </Text>
      </View>
      <Text
        style={{
          margin: 15,
          width: '100%',
          fontSize: 16,
          color: '#000',
          fontWeight: '600',
        }}>
        {selectedAddress}
      </Text>
      <TouchableOpacity
        disabled={selectedAddress == 'No Selected Address' ? true : false}
        style={[
          styles.checkoutBtn,
          {
            backgroundColor:
              selectedAddress == 'No Selected Address' ? '#DADADA' : 'green',
          },
        ]}
        onPress={() => {
          Alert.alert(
            'Konfirmasi',
            'Apakah Anda yakin ingin bayar?',
            [
              {
                text: 'Batal',
                onPress: () => console.log('Canceled'),
                style: 'cancel',
              },
              {
                text: 'Ya',
                onPress: () => payNow(), // Panggil fungsi deleteImage saat tombol "Hapus" ditekan
                style: 'destructive',
              },
            ],
            {cancelable: true},
          );
        }}>
        <Text style={{color: '#fff', fontSize: 18, fontWeight: '600'}}>
          Bayar Sekarang {'Rp ' + getTotal()}
        </Text>
        <Loader modalVisible={modalVisible} setModalVisible={setModalVisible} />
      </TouchableOpacity>
    </View>
  );
};

export default Checkout;
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
    width: '35%',
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
  totalView: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingLeft: 20,
    height: 50,
    borderTopWidth: 0.3,
    paddingRight: 20,
    marginTop: 20,
    alignItems: 'center',
    borderTopColor: '#8e8e8e',
  },
  editAddress: {
    color: '#2F62D1',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  checkoutBtn: {
    width: '90%',
    height: 50,
    borderRadius: 10,
    backgroundColor: 'green',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

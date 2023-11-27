/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused, useNavigation} from '@react-navigation/native';
const Items = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  useEffect(() => {
    getItems();
  }, [isFocused]);
  const getItems = () => {
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
  };

  const deleteItem = docId => {
    firestore()
      .collection('items')
      .doc(docId)
      .delete()
      .then(() => {
        console.log('Product berhasil dihapus!');
        getItems();
      });
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Daftar Produk</Text>
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
        data={items}
        renderItem={({item, index}) => {
          return (
            <View style={styles.itemView}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('DetailItem', {
                    data: item.data,
                    id: item.id,
                  });
                }}>
                <Image
                  source={{uri: item.data.imageUrl}}
                  style={styles.itemImage}
                />
              </TouchableOpacity>
              <View style={styles.nameView}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('DetailItem', {
                      data: item.data,
                      id: item.id,
                    });
                  }}>
                  <Text style={styles.nameText}>{item.data.name}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    {[...Array(5)].map((_, index) => (
                      <Image
                        key={index}
                        source={require('../images/fullStar.png')}
                        style={{width: 20, height: 15}}
                      />
                    ))}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        marginLeft: 5,
                      }}>
                      {item.data.rating}
                    </Text>
                  </View>
                  <View style={styles.priceView}>
                    {item.data.price > 20000 ? (
                      <>
                        <Text style={styles.priceText}>
                          {'Rp ' + item.data.discountPrice}
                        </Text>
                        <Text style={styles.discountText}>
                          {'Rp ' + item.data.price}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.priceText}>
                        {'Rp ' + item.data.price}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{margin: 10}}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('EditItem', {
                      data: item.data,
                      id: item.id,
                    });
                  }}>
                  <Image
                    source={require('../images/edit.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteItem(item.id);
                  }}>
                  <Image
                    source={require('../images/delete.png')}
                    style={[styles.icon, {marginTop: 20}]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default Items;
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
    justifyContent: 'space-between',
  },
  headerText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '700',
    color: 'purple',
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
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    margin: 5,
  },
  nameView: {
    width: '53%',
    margin: 10,
  },
  priceView: {
    flexDirection: 'row',
    marginTop: 2,
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
  icon: {
    width: 24,
    height: 24,
  },
});

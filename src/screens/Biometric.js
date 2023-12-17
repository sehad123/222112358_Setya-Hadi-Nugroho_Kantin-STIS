/* eslint-disable prettier/prettier */
import {BackHandler, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import TouchID from 'react-native-touch-id';
import SelectLogin from './user/SelectLogin';

const Biometric = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false); // Tambah state untuk mengatur keberhasilan autentikasi

  const optionalConfigObject = {
    title: 'Provide Your Touch ID',
    imageColor: '#e00606',
    imageErrorColor: '#ff0000',
    sensorDescription: 'Touch sensor',
    sensorErrorDescription: 'Failed',
    cancelText: 'Cancel',
    fallbackLabel: 'Show Passcode',
    unifiedErrors: false,
    passcodeFallback: false,
  };

  useEffect(() => {
    handleBiometric();
  }, [authSuccess]); // Gunakan [authSuccess] sebagai dependencies untuk useEffect

  const handleBiometric = () => {
    TouchID.isSupported().then(biometricType => {
      if (biometricType === 'FaceID') {
        console.log('faceID is supported');
      } else {
        console.log('Touch ID is supported');
        if (isAuth) {
          return null;
        }
        TouchID.authenticate('', optionalConfigObject)
          .then(success => {
            console.log('Success', success);
            setIsAuth(success);
            if (success) {
              setAuthSuccess(true); // Set state authSuccess ke true jika autentikasi berhasil
            }
          })
          .catch(err => {
            BackHandler.exitApp();
          });
      }
    });
  };

  if (authSuccess) {
    return <SelectLogin />; // Kembalikan halaman login jika autentikasi berhasil
  }

  return (
    <View>
      <Text>Biometric</Text>
    </View>
  );
};

export default Biometric;

const styles = StyleSheet.create({});

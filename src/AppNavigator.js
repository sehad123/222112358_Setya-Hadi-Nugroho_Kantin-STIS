/* eslint-disable prettier/prettier */
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Splash from './screens/Splash';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import EditItem from './screens/EditItem';
import DetailItem from './screens/DetailItem';
import SelectLogin from './screens/user/SelectLogin';
import UserLogin from './screens/user/UserLogin';
import UserSignup from './screens/user/UserSignup';
import Home from './screens/user/Home';
import Main from './screens/user/home_tabs/Main';
import Cart from './screens/user/Cart';
import Chekout from './screens/user/checkout/Chekout';
import Address from './screens/user/checkout/Address';
import AddNewAddres from './screens/user/checkout/AddNewAddres';
import OrderStatus from './screens/user/checkout/OrderStatus';
import Detail from './screens/user/Detail';
import Items from './tabs/Items';
import Profile from './screens/user/home_tabs/Profile';
import Orders from './screens/user/home_tabs/Orders';
import Delivery from './screens/user/checkout/Delivery';
import Biometric from './screens/Biometric';
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EditItem"
          component={EditItem}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DetailItem"
          component={DetailItem}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SelectLogin"
          component={SelectLogin}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="UserLogin"
          component={UserLogin}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="UserSignup"
          component={UserSignup}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Main"
          component={Main}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Cart"
          component={Cart}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Checkout"
          component={Chekout}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Address"
          component={Address}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="AddNewAddress"
          component={AddNewAddres}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="OrderStatus"
          component={OrderStatus}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Detail"
          component={Detail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Items"
          component={Items}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Orders"
          component={Orders}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Delivery"
          component={Delivery}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Biometric"
          component={Biometric}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

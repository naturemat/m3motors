import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MechanicStackParamList} from './types';
import MechanicDashboard from '../screens/mechanic/MechanicDashboard';
import QRScanner from '../screens/mechanic/QRScanner';
import ActivateCustomer from '../screens/mechanic/ActivateCustomer';
import VehicleHistory from '../screens/mechanic/VehicleHistory';
import NewService from '../screens/mechanic/NewService';

const Stack = createNativeStackNavigator<MechanicStackParamList>();

export default function MechanicNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: '#F4F6F7'},
      }}>
      <Stack.Screen name="MechanicDashboard" component={MechanicDashboard} />
      <Stack.Screen name="QRScanner" component={QRScanner} />
      <Stack.Screen name="ActivateCustomer" component={ActivateCustomer} />
      <Stack.Screen name="VehicleHistory" component={VehicleHistory} />
      <Stack.Screen name="NewService" component={NewService} />
    </Stack.Navigator>
  );
}

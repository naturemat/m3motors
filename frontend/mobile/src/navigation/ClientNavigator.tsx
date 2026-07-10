import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ClientStackParamList} from './types';
import ClientDashboard from '../screens/client/ClientDashboard';
import ClientHistory from '../screens/client/ClientHistory';
import ClientQR from '../screens/client/ClientQR';
import UpdateKM from '../screens/client/UpdateKM';
import ClientProfile from '../screens/client/ClientProfile';

const Stack = createNativeStackNavigator<ClientStackParamList>();

export default function ClientNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: '#F4F6F7'},
      }}>
      <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
      <Stack.Screen name="ClientHistory" component={ClientHistory} />
      <Stack.Screen name="ClientQR" component={ClientQR} />
      <Stack.Screen name="UpdateKM" component={UpdateKM} />
      <Stack.Screen name="ClientProfile" component={ClientProfile} />
    </Stack.Navigator>
  );
}

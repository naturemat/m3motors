import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import {useAuthStore} from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MechanicNavigator from './MechanicNavigator';
import ClientNavigator from './ClientNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const {isAuthenticated, user} = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user?.role === 'mechanic' ? (
        <Stack.Screen name="MechanicApp" component={MechanicNavigator} />
      ) : (
        <Stack.Screen name="ClientApp" component={ClientNavigator} />
      )}
    </Stack.Navigator>
  );
}

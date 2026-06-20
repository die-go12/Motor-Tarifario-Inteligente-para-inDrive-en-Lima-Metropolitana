import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DriverMapScreen } from '../screens/driver/DriverMapScreen';
import { TripOffersScreen } from '../screens/driver/TripOffersScreen';
import { ActiveTripScreen } from '../screens/driver/ActiveTripScreen';
import { DriverTripAcceptedScreen } from '../screens/driver/DriverTripAcceptedScreen';

export type DriverStackParamList = {
  DriverMap: undefined;
  TripOffers: undefined;
  ActiveTrip: { tripId: string };
  DriverTripAccepted: undefined;
};

const Stack = createNativeStackNavigator<DriverStackParamList>();

export const DriverNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DriverMap" component={DriverMapScreen} />
    <Stack.Screen name="TripOffers" component={TripOffersScreen} />
    <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} />
    <Stack.Screen name="DriverTripAccepted" component={DriverTripAcceptedScreen} />
  </Stack.Navigator>
);

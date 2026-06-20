import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PassengerMapScreen } from '../screens/passenger/PassengerMapScreen';
import { SearchTripScreen } from '../screens/passenger/SearchTripScreen';
import { NegotiationScreen } from '../screens/passenger/NegotiationScreen';
import { TripAcceptedScreen } from '../screens/passenger/TripAcceptedScreen';

export type PassengerStackParamList = {
  PassengerMap: undefined;
  SearchTrip: undefined;
  Negotiation: { tripId: string };
  TripAccepted: undefined;
};

const Stack = createNativeStackNavigator<PassengerStackParamList>();

export const PassengerNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PassengerMap" component={PassengerMapScreen} />
    <Stack.Screen name="SearchTrip" component={SearchTripScreen} />
    <Stack.Screen name="Negotiation" component={NegotiationScreen} />
    <Stack.Screen name="TripAccepted" component={TripAcceptedScreen} />
  </Stack.Navigator>
);

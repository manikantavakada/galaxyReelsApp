import React from 'react';
import {DarkTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ReelsScreen from '../screens/ReelsScreen';
import {COLORS} from '../utils/constants';

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.accent,
    background: COLORS.background,
    card: COLORS.background,
    text: COLORS.text,
    border: COLORS.surfaceBorder,
    notification: COLORS.accent,
  },
};


const AppNavigator = () => {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Reels"
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: COLORS.background},
        }}>
        <Stack.Screen name="Reels" component={ReelsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

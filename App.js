import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import Start from './components/start';
import Chat from './components/chat';
// import react native gesture handler
import 'react-native-gesture-handler';

// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
export default class Main extends Component {
  constructor() {
    super();
      this.state = {

      };
    
  }
  componentDidMount() {
    //save
    
  }
  componentWillUnmount() {
    
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
        initialRouteName="Start"
      >
        <Stack.Screen
          name="Start"
          component={Start}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
        />
      </Stack.Navigator>
      </NavigationContainer>
      
      
    );
  }
}

const styles = StyleSheet.create({
  
});

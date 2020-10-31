import React from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat'
import { color } from "react-native-reanimated";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      color: "#fff",
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      uid: 0,
      loggedInText: "",
      isConnected: false
    }

    const firebaseConfig = {
      apiKey: "AIzaSyAwwXNvHOpqLK78_DIL8VEhJXTzP1M3wEs",
      authDomain: "test-3c75d.firebaseapp.com",
      databaseURL: "https://test-3c75d.firebaseio.com",
      projectId: "test-3c75d",
      storageBucket: "test-3c75d.appspot.com",
      messagingSenderId: "143609071198",
      appId: "1:143609071198:web:54489eefb4393dcc4cd6cf",
      measurementId: "G-7K3F9BKD1D"
    };

    if (!firebase.apps.length){
      firebase.initializeApp(firebaseConfig);
    }

    this.referenceMessages = firebase.firestore().collection("messages");
  }

  componentDidMount() {
    //get name and color from previous component
    let { name } = this.props.route.params;
    let { color } = this.props.route.params;
    this.setState({color});
    //set the title of the component (as shown on the top of the screen) as the name
    this.props.navigation.setOptions({ title: name });
    //get network info; if connected then get messages from db else get from interal storage
    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        console.log('online');
        this.setState({isConnected: true});
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            try {
              await firebase.auth().signInAnonymously();
              console.log(user);
            } catch (error) {
              console.log(error);
            }
            
          }
          this.setState({
            uid: user.uid,
            loggedInText: "Hello there"
          });
        });
        this.unsubscribe = this.referenceMessages.orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
      } else {
        this.setState({isConnected: false});
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  //get messages from internal storage if offline
  async getMessages() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  //delete messages from internal storage
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  //save message from state to internal storage
  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  //when db updates with new message add to state
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text.toString(),
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar
        }
      });
    });
    this.setState({
      messages,
    });
  };

  //add messages to db
  addMessages() {
    this.referenceMessages.add({
      _id: this.state.messages[0]._id,
      text: this.state.messages[0].text,
      createdAt: this.state.messages[0].createdAt,
      user: this.state.messages[0].user,
      uid: this.state.uid
    });
  }

  // when message is sent append it to array in previous state
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.addMessages();
      this.saveMessages();
    }
    );
  }
  // apply styling to message bubble component
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    )
  }

  renderInputToolbar(props) {
    if (!this.state.isConnected) {
    } else {
      return <InputToolbar {...props} />;
    }
  };
  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  render() {
    return (
      <View style={{backgroundColor: this.state.color, flex: 1}}>
        <GiftedChat
        renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
          _id: 1,
          }}
        />
        {/* move input field with keyboard on android*/}
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    )
  }
}